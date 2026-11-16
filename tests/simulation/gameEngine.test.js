import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  createGame,
  installComponent,
  uninstallComponent,
  loadFuel,
  getGameResources,
  checkLaunchReadiness,
  launchMission,
  completeGameObjective,
  moveToNextPhase,
  getGameProgress,
  getGameScore,
  getFinalMissionResult,
  getGameSimulation,
  getLastSimulationResult,
  resetMission
} from "../../src/simulation/gameEngine.js";

describe("Main Game Engine", () => {
  function setupReadyGame(missionId = "earth-observation") {
    let game = createGame(6000000);
    game = installComponent(game, "rocket");
    game = installComponent(game, "spacecraft-bus");
    game = installComponent(game, "fuel-tank");
    game = installComponent(game, "solar-panel");
    game = installComponent(game, "battery");
    game = installComponent(game, "camera");
    if (missionId === "lunar-survey" || missionId === "mars-exploration") {
      game = installComponent(game, "antenna");
    }
    game = loadFuel(game, 300);
    return game;
  }

  test("initial game configuration and resource calculation", () => {
    const game = setupReadyGame("earth-observation");
    assert.strictEqual(game.launched, false);
    assert.strictEqual(game.missionState, null);
    assert.strictEqual(game.simulationState, null);

    const resources = getGameResources(game);
    assert.ok(resources);
    assert.strictEqual(resources.fuelKg, 300);
    assert.strictEqual(resources.batteryCapacityWh, 2000);

    const readiness = checkLaunchReadiness(game, "earth-observation");
    assert.strictEqual(readiness.ready, true);
    assert.strictEqual(readiness.errors.length, 0);
  });

  test("rejects spacecraft modifications and multiple launches after launch", () => {
    let game = setupReadyGame("earth-observation");
    const launchResult = launchMission(game, "earth-observation");
    assert.strictEqual(launchResult.success, true);
    game = launchResult.game;
    assert.strictEqual(game.launched, true);

    assert.throws(
      () => installComponent(game, "antenna"),
      /Cannot modify spacecraft after launch/
    );
    assert.throws(
      () => uninstallComponent(game, "camera"),
      /Cannot modify spacecraft after launch/
    );
    assert.throws(
      () => loadFuel(game, 400),
      /Cannot load fuel after launch/
    );
    assert.throws(
      () => launchMission(game, "earth-observation"),
      /Mission has already been launched/
    );
  });

  test("initial mission progress starts with zero completed objectives and 0%", () => {
    let game = setupReadyGame("earth-observation");
    const launchResult = launchMission(game, "earth-observation");
    game = launchResult.game;

    const progress = getGameProgress(game);
    assert.strictEqual(progress.completedObjectives, 0);
    assert.strictEqual(progress.totalObjectives, 3);
    assert.strictEqual(progress.progressPercentage, 0);
    assert.strictEqual(progress.status, "in_progress");
  });

  test("successful mission synchronizes simulationState.status and lastSimulationResult on completion", () => {
    let game = setupReadyGame("earth-observation");
    game = launchMission(game, "earth-observation").game;

    // Verify all 3 objectives
    game = completeGameObjective(game, "reach-orbit");
    game = completeGameObjective(game, "capture-images");
    game = completeGameObjective(game, "send-data");

    // Advance through all 5 phases (Pre-launch, Launch, Orbit Insertion, Science Operations, Mission Complete)
    for (let i = 0; i < 5; i++) {
      game = moveToNextPhase(game);
    }

    // 1. Mission state must be completed
    assert.strictEqual(game.missionState.status, "completed");

    // 2. Simulation state must be synchronized to "completed" (Fix for Issue 1)
    assert.strictEqual(game.simulationState.status, "completed");

    // 3. lastSimulationResult.simulationState must also be "completed"
    const lastResult = getLastSimulationResult(game);
    assert.ok(lastResult);
    assert.strictEqual(lastResult.success, true);
    assert.strictEqual(lastResult.simulationState.status, "completed");

    // 4. getGameSimulation summary reflects "completed"
    const summary = getGameSimulation(game);
    assert.strictEqual(summary.status, "completed");
    assert.strictEqual(summary.completedPhases, 5);

    // 5. Final scoring evaluates properly
    const score = getGameScore(game);
    assert.strictEqual(score.totalScore, 500);

    const finalResult = getFinalMissionResult(game);
    assert.strictEqual(finalResult.successful, true);
    assert.strictEqual(finalResult.rating, "Excellent");
  });

  test("terminal phase protection prevents duplicate simulation and throws on subsequent calls", () => {
    let game = setupReadyGame("earth-observation");
    game = launchMission(game, "earth-observation").game;

    game = completeGameObjective(game, "reach-orbit");
    game = completeGameObjective(game, "capture-images");
    game = completeGameObjective(game, "send-data");

    for (let i = 0; i < 5; i++) {
      game = moveToNextPhase(game);
    }

    assert.strictEqual(game.simulationState.history.length, 5);
    assert.strictEqual(game.missionState.status, "completed");

    // Calling moveToNextPhase a 6th time must throw because mission is completed
    assert.throws(
      () => moveToNextPhase(game),
      /Mission is no longer active/
    );

    // History remains exactly 5 entries, no duplicate terminal-phase history
    assert.strictEqual(game.simulationState.history.length, 5);
  });

  test("incomplete objectives explicitly fail mission at terminal phase and prevent infinite loop", () => {
    let game = setupReadyGame("earth-observation");
    game = launchMission(game, "earth-observation").game;

    // Do NOT complete objectives
    for (let i = 0; i < 5; i++) {
      game = moveToNextPhase(game);
    }

    // Status resolves explicitly to "failed" due to incomplete objectives
    assert.strictEqual(game.missionState.status, "failed");
    assert.strictEqual(game.simulationState.status, "failed");
    assert.strictEqual(game.simulationState.history.length, 5);

    const lastResult = getLastSimulationResult(game);
    assert.strictEqual(lastResult.success, false);
    assert.strictEqual(lastResult.reason, "Mission objectives not completed");

    // Next call is blocked, preventing infinite progression loop
    assert.throws(
      () => moveToNextPhase(game),
      /Mission is no longer active/
    );

    // History still has exactly 5 entries
    assert.strictEqual(game.simulationState.history.length, 5);
  });

  test("completed and failed missions reject further objective completions", () => {
    let game = setupReadyGame("earth-observation");
    game = launchMission(game, "earth-observation").game;

    game = completeGameObjective(game, "reach-orbit");
    game = completeGameObjective(game, "capture-images");
    game = completeGameObjective(game, "send-data");

    for (let i = 0; i < 5; i++) {
      game = moveToNextPhase(game);
    }
    assert.strictEqual(game.missionState.status, "completed");

    assert.throws(
      () => completeGameObjective(game, "reach-orbit"),
      /Mission is no longer active/
    );
  });

  test("in-flight fuel exhaustion transitions to failed state and halts progression", () => {
    let game = createGame(6000000);
    game = installComponent(game, "rocket");
    game = installComponent(game, "spacecraft-bus");
    game = installComponent(game, "fuel-tank");
    game = installComponent(game, "solar-panel");
    game = installComponent(game, "battery");
    game = installComponent(game, "camera");
    game = loadFuel(game, 100); // 100 kg fuel
    game = launchMission(game, "earth-observation").game;

    // Phase 1: Pre-launch consumes 0 kg -> remaining 100 kg
    game = moveToNextPhase(game);
    assert.strictEqual(game.simulationState.fuelRemainingKg, 100);

    // Phase 2: Launch consumes 30 kg -> remaining 70 kg
    game = moveToNextPhase(game);
    assert.strictEqual(game.simulationState.fuelRemainingKg, 70);

    // Phase 3: Orbit Insertion consumes 20 kg -> remaining 50 kg
    game = moveToNextPhase(game);
    assert.strictEqual(game.simulationState.fuelRemainingKg, 50);

    // Artificially drain remaining fuel to test exhaustion in next phase
    game.simulationState.fuelRemainingKg = 1;

    // Phase 4: Science Operations requires 5 kg -> failure
    game = moveToNextPhase(game);
    assert.strictEqual(game.missionState.status, "failed");
    assert.strictEqual(game.simulationState.status, "failed");
    assert.strictEqual(getLastSimulationResult(game).reason, "Insufficient fuel");

    // Any subsequent phase attempt is blocked
    assert.throws(
      () => moveToNextPhase(game),
      /Mission is no longer active/
    );
  });

  test("resetMission resets flight state while preserving spacecraft configuration and budget", () => {
    let game = setupReadyGame("earth-observation");
    game = launchMission(game, "earth-observation").game;
    game = completeGameObjective(game, "reach-orbit");
    game = moveToNextPhase(game);

    assert.strictEqual(game.launched, true);
    assert.ok(game.missionState);
    assert.ok(game.simulationState);

    const reset = resetMission(game);
    assert.strictEqual(reset.launched, false);
    assert.strictEqual(reset.missionState, null);
    assert.strictEqual(reset.simulationState, null);
    assert.strictEqual(reset.lastSimulationResult, null);

    // Spacecraft configuration preserved
    assert.strictEqual(reset.spacecraft.fuelKg, 300);
    assert.strictEqual(reset.spacecraft.selectedComponentIds.length, 6);
    assert.strictEqual(reset.budget, 6000000);

    // Can be re-launched
    const secondLaunch = launchMission(reset, "earth-observation");
    assert.strictEqual(secondLaunch.success, true);
    assert.strictEqual(secondLaunch.game.launched, true);
  });
});

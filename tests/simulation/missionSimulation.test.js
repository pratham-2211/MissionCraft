import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  createSimulationState,
  simulateMissionPhase,
  getSimulationSummary,
  PHASE_RESOURCE_SETTINGS
} from "../../src/simulation/missionSimulation.js";
import {
  createInitialSpacecraftConfig,
  addComponent,
  updateFuel
} from "../../src/simulation/spacecraftConfig.js";
import { createMissionState } from "../../src/simulation/missionController.js";

describe("Mission Simulation", () => {
  test("PHASE_RESOURCE_SETTINGS defines resource costs for standard phases", () => {
    assert.ok(PHASE_RESOURCE_SETTINGS["Pre-launch"]);
    assert.ok(PHASE_RESOURCE_SETTINGS["Launch"]);
    assert.ok(PHASE_RESOURCE_SETTINGS["Orbit Insertion"]);
    assert.ok(PHASE_RESOURCE_SETTINGS["Science Operations"]);
    assert.ok(PHASE_RESOURCE_SETTINGS["Mission Complete"]);
  });

  test("createSimulationState initializes ready state", () => {
    let spacecraft = createInitialSpacecraftConfig();
    spacecraft = updateFuel(spacecraft, 300);

    const state = createSimulationState(spacecraft);
    assert.strictEqual(state.fuelRemainingKg, 300);
    assert.strictEqual(state.batteryEnergyWh, 0);
    assert.strictEqual(state.elapsedHours, 0);
    assert.deepStrictEqual(state.history, []);
    assert.strictEqual(state.status, "ready");
  });

  test("simulateMissionPhase consumes fuel and power for a valid phase", () => {
    let spacecraft = createInitialSpacecraftConfig();
    spacecraft = addComponent(spacecraft, "rocket");
    spacecraft = addComponent(spacecraft, "spacecraft-bus");
    spacecraft = addComponent(spacecraft, "fuel-tank");
    spacecraft = addComponent(spacecraft, "solar-panel"); // 500W
    spacecraft = addComponent(spacecraft, "battery");     // 2000Wh
    spacecraft = addComponent(spacecraft, "camera");      // 100W
    spacecraft = updateFuel(spacecraft, 300);

    const missionState = createMissionState("earth-observation"); // Phase 0: Pre-launch (duration 1h, fuel 0, extraPower 20W)
    const simState = createSimulationState(spacecraft);

    const result = simulateMissionPhase(spacecraft, missionState, simState);
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.phase, "Pre-launch");
    assert.strictEqual(result.simulationState.status, "in_progress");
    assert.strictEqual(result.simulationState.fuelRemainingKg, 300);
    assert.strictEqual(result.simulationState.elapsedHours, 1);
    // Generation: 500W * 1h = 500Wh. Consumption: (100 + 20)W * 1h = 120Wh.
    // Battery stores surplus: 500 - 120 = 380Wh.
    assert.strictEqual(result.simulationState.batteryEnergyWh, 380);
    assert.strictEqual(result.simulationState.history.length, 1);
  });

  test("simulateMissionPhase fails when fuel is insufficient", () => {
    let spacecraft = createInitialSpacecraftConfig();
    spacecraft = addComponent(spacecraft, "rocket");
    spacecraft = addComponent(spacecraft, "spacecraft-bus");
    spacecraft = addComponent(spacecraft, "fuel-tank");
    spacecraft = addComponent(spacecraft, "solar-panel");
    spacecraft = addComponent(spacecraft, "battery");
    spacecraft = addComponent(spacecraft, "camera");
    spacecraft = updateFuel(spacecraft, 10); // Phase 1 (Launch) requires 30 kg

    const missionState = {
      missionId: "earth-observation",
      currentPhaseIndex: 1, // Launch
      completedObjectiveIds: [],
      status: "in_progress"
    };

    const simState = {
      fuelRemainingKg: 10,
      batteryEnergyWh: 500,
      elapsedHours: 1,
      history: [],
      status: "in_progress"
    };

    const result = simulateMissionPhase(spacecraft, missionState, simState);
    assert.strictEqual(result.success, false);
    assert.strictEqual(result.reason, "Insufficient fuel");
    assert.strictEqual(result.simulationState.status, "failed");
  });

  test("simulateMissionPhase fails when electrical energy is insufficient", () => {
    let spacecraft = createInitialSpacecraftConfig();
    spacecraft = addComponent(spacecraft, "rocket");
    spacecraft = addComponent(spacecraft, "spacecraft-bus");
    spacecraft = addComponent(spacecraft, "fuel-tank");
    spacecraft = addComponent(spacecraft, "camera"); // 100W consumption, NO solar panel
    spacecraft = updateFuel(spacecraft, 300);

    const missionState = createMissionState("earth-observation");
    const simState = {
      fuelRemainingKg: 300,
      batteryEnergyWh: 0, // No battery stored energy
      elapsedHours: 0,
      history: [],
      status: "ready"
    };

    const result = simulateMissionPhase(spacecraft, missionState, simState);
    assert.strictEqual(result.success, false);
    assert.strictEqual(result.reason, "Insufficient electrical energy");
    assert.strictEqual(result.simulationState.status, "failed");
  });

  test("simulateMissionPhase throws when called on an inactive simulation", () => {
    const spacecraft = createInitialSpacecraftConfig();
    const missionState = createMissionState("earth-observation");
    const failedSim = {
      fuelRemainingKg: 0,
      batteryEnergyWh: 0,
      elapsedHours: 0,
      history: [],
      status: "failed"
    };

    assert.throws(
      () => simulateMissionPhase(spacecraft, missionState, failedSim),
      /Simulation is not active/
    );
  });

  test("getSimulationSummary returns structured telemetry summary", () => {
    const simState = {
      fuelRemainingKg: 245,
      batteryEnergyWh: 1685,
      elapsedHours: 4.5,
      history: [{ phase: "Pre-launch" }, { phase: "Launch" }],
      status: "completed"
    };

    const summary = getSimulationSummary(simState);
    assert.strictEqual(summary.fuelRemainingKg, 245);
    assert.strictEqual(summary.batteryEnergyWh, 1685);
    assert.strictEqual(summary.elapsedHours, 4.5);
    assert.strictEqual(summary.completedPhases, 2);
    assert.strictEqual(summary.status, "completed");
  });
});

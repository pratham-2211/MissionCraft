
import {
  createGame,
  installComponent,
  loadFuel,
  launchMission,
  completeGameObjective,
  moveToNextPhase,
  getGameProgress,
  getGameScore,
  getFinalMissionResult,
  getGameSimulation,
  getLastSimulationResult
} from "./gameEngine.js";

// 1. Create game
let game = createGame(6000000, "MissionCraft");

// 2. Install components
game = installComponent(game, "rocket");
game = installComponent(game, "spacecraft-bus");
game = installComponent(game, "fuel-tank");
game = installComponent(game, "solar-panel");
game = installComponent(game, "battery");
game = installComponent(game, "camera");

// 3. Load fuel
game = loadFuel(game, 300);

console.log("INITIAL GAME:", game);

// 4. Launch mission
const launchResult = launchMission(game, "earth-observation");

console.log("LAUNCH RESULT:", launchResult);

if (!launchResult.success) {
  console.log("LAUNCH FAILED:", launchResult);
} else {
  game = launchResult.game;

  // 5. Complete objectives
  game = completeGameObjective(game, "reach-orbit");
  game = completeGameObjective(game, "capture-images");
  game = completeGameObjective(game, "send-data");

  console.log("MISSION PROGRESS:", getGameProgress(game));

  // 6. Simulate all mission phases
  for (let i = 0; i < 5; i++) {
    game = moveToNextPhase(game);

    const lastResult = getLastSimulationResult(game);

    console.log(`PHASE ${i + 1}:`, lastResult);

    if (!lastResult || !lastResult.success) {
      console.log("SIMULATION FAILED:", lastResult?.reason);
      break;
    }

    if (getGameProgress(game).status === "completed") {
      break;
    }
  }

  // 7. Final results
  console.log("FINAL PROGRESS:", getGameProgress(game));
  console.log("FINAL SCORE:", getGameScore(game));
  console.log("FINAL MISSION RESULT:", getFinalMissionResult(game));
  console.log("SIMULATION SUMMARY:", getGameSimulation(game));
}

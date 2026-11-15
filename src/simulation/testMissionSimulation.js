
import {
  createGame,
  installComponent,
  loadFuel,
  launchMission,
  completeGameObjective,
  moveToNextPhase,
  getGameSimulation,
  getGameProgress
} from "./gameEngine.js";

// Create game
let game = createGame(6000000);

// Install components
game = installComponent(game, "rocket");
game = installComponent(game, "spacecraft-bus");
game = installComponent(game, "fuel-tank");
game = installComponent(game, "solar-panel");
game = installComponent(game, "battery");
game = installComponent(game, "camera");

// Load fuel
game = loadFuel(game, 300);

// Launch mission
const launchResult = launchMission(
  game,
  "earth-observation"
);

console.log("LAUNCH SUCCESS:", launchResult.success);

if (!launchResult.success) {
  console.log("LAUNCH ERRORS:", launchResult.validation.errors);
} else {
  game = launchResult.game;

  // Complete objectives
  game = completeGameObjective(game, "reach-orbit");
  game = completeGameObjective(game, "capture-images");
  game = completeGameObjective(game, "send-data");

  // Simulate all mission phases
  for (let i = 0; i < 5; i++) {
    game = moveToNextPhase(game);

    console.log(
      "PHASE RESULT:",
      game.lastSimulationResult
    );

    if (
      game.missionState.status === "failed" ||
      game.missionState.status === "completed"
    ) {
      break;
    }
  }

  console.log(
    "FINAL MISSION STATUS:",
    game.missionState.status
  );

  console.log(
    "MISSION PROGRESS:",
    getGameProgress(game)
  );

  console.log(
    "RESOURCE SUMMARY:",
    getGameSimulation(game)
  );
}

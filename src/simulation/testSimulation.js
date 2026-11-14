
import {
  createGame,
  installComponent,
  loadFuel,
  getGameResources,
  checkLaunchReadiness,
  launchMission,
  completeGameObjective,
  moveToNextPhase,
  getFinalMissionResult
} from "./gameEngine.js";

// 1. Create a new game
let game = createGame(6000000);

// 2. Install spacecraft components
game = installComponent(game, "rocket");
game = installComponent(game, "spacecraft-bus");
game = installComponent(game, "fuel-tank");
game = installComponent(game, "solar-panel");
game = installComponent(game, "camera");

// 3. Load fuel
game = loadFuel(game, 100);

// 4. Check resources
console.log("RESOURCES:", getGameResources(game));

// 5. Check launch readiness
const readiness = checkLaunchReadiness(
  game,
  "earth-observation"
);

console.log("LAUNCH READINESS:", readiness);

// 6. Launch mission
const launchResult = launchMission(
  game,
  "earth-observation"
);

console.log("LAUNCH RESULT:", launchResult.success);

if (!launchResult.success) {
  console.log("Launch errors:", launchResult.validation.errors);
} else {
  game = launchResult.game;

  // 7. Complete all mission objectives
  game = completeGameObjective(game, "reach-orbit");
  game = completeGameObjective(game, "capture-images");
  game = completeGameObjective(game, "send-data");

  // 8. Advance through all mission phases
  for (let i = 0; i < 5; i++) {
    game = moveToNextPhase(game);
  }

  // 9. Display final result
  console.log("FINAL RESULT:", getFinalMissionResult(game));
}

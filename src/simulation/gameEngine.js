
/**
 * MissionCraft - Main Game Engine
 *
 * Connects spacecraft configuration, resource management,
 * launch validation, mission control, simulation and scoring.
 */

import {
  createInitialSpacecraftConfig,
  addComponent,
  removeComponent,
  updateFuel
} from "./spacecraftConfig.js";

import { calculateResources } from "./resourceManager.js";
import { validateLaunch } from "./launchValidator.js";

import {
  createMissionState,
  getMissionById,
  completeObjective,
  advanceMissionPhase,
  getMissionProgress
} from "./missionController.js";

import {
  calculateMissionScore,
  getMissionResult
} from "./scoring.js";

import {
  createSimulationState,
  simulateMissionPhase,
  getSimulationSummary
} from "./missionSimulation.js";

// Create new game
export function createGame(budget = 6000000) {
  return {
    spacecraft: createInitialSpacecraftConfig(),
    budget,
    missionState: null,
    simulationState: null,
    lastSimulationResult: null,
    launched: false
  };
}

// Install spacecraft component
export function installComponent(game, componentId) {
  if (game.launched) {
    throw new Error("Cannot modify spacecraft after launch.");
  }

  return {
    ...game,
    spacecraft: addComponent(game.spacecraft, componentId)
  };
}

// Uninstall spacecraft component
export function uninstallComponent(game, componentId) {
  if (game.launched) {
    throw new Error("Cannot modify spacecraft after launch.");
  }

  return {
    ...game,
    spacecraft: removeComponent(game.spacecraft, componentId)
  };
}

// Load fuel
export function loadFuel(game, fuelKg) {
  if (game.launched) {
    throw new Error("Cannot load fuel after launch.");
  }

  return {
    ...game,
    spacecraft: updateFuel(game.spacecraft, fuelKg)
  };
}

// Get spacecraft resources
export function getGameResources(game) {
  return calculateResources(game.spacecraft, game.budget);
}

// Check launch readiness
export function checkLaunchReadiness(game, missionId) {
  const mission = getMissionById(missionId);

  if (!mission) {
    throw new Error(`Mission not found: ${missionId}`);
  }

  return validateLaunch(
    game.spacecraft,
    mission,
    game.budget
  );
}

// Launch mission
export function launchMission(game, missionId) {
  if (game.launched) {
    throw new Error("Mission has already been launched.");
  }

  const validation = checkLaunchReadiness(game, missionId);

  if (!validation.ready) {
    return {
      game,
      success: false,
      validation
    };
  }

  const updatedGame = {
    ...game,
    missionState: createMissionState(missionId),
    simulationState: createSimulationState(game.spacecraft),
    lastSimulationResult: null,
    launched: true
  };

  return {
    game: updatedGame,
    success: true,
    validation
  };
}

// Complete mission objective
export function completeGameObjective(game, objectiveId) {
  if (!game.launched || !game.missionState) {
    throw new Error("Launch the mission first.");
  }

  if (
    game.missionState.status === "failed" ||
    game.missionState.status === "completed"
  ) {
    throw new Error("Mission is no longer active.");
  }

  return {
    ...game,
    missionState: completeObjective(
      game.missionState,
      objectiveId
    )
  };
}

// Simulate current phase and advance mission
export function moveToNextPhase(game) {
  if (!game.launched || !game.missionState) {
    throw new Error("Launch the mission first.");
  }

  if (
    game.missionState.status === "failed" ||
    game.missionState.status === "completed"
  ) {
    throw new Error("Mission is no longer active.");
  }

  const result = simulateMissionPhase(
    game.spacecraft,
    game.missionState,
    game.simulationState
  );

  // Handle resource failure
  if (!result.success) {
    return {
      ...game,
      simulationState: result.simulationState,
      missionState: {
        ...game.missionState,
        status: "failed"
      },
      lastSimulationResult: result
    };
  }

  // Advance phase
  const updatedMissionState = advanceMissionPhase(
    game.missionState
  );

  return {
    ...game,
    simulationState: result.simulationState,
    missionState: updatedMissionState,
    lastSimulationResult: result
  };
}

// Get mission progress
export function getGameProgress(game) {
  if (!game.missionState) {
    return null;
  }

  return getMissionProgress(game.missionState);
}

// Get current mission score
export function getGameScore(game) {
  if (!game.missionState) {
    return null;
  }

  return calculateMissionScore(game.missionState);
}

// Get final mission result
export function getFinalMissionResult(game) {
  if (!game.missionState) {
    return null;
  }

  return getMissionResult(game.missionState);
}

// Get simulation summary
export function getGameSimulation(game) {
  if (!game.simulationState) {
    return null;
  }

  return getSimulationSummary(game.simulationState);
}

// Get latest phase result
export function getLastSimulationResult(game) {
  return game.lastSimulationResult;
}

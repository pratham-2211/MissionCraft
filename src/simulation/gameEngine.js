
/**
 * MissionCraft - Main Game Engine
 *
 * Connects spacecraft configuration, resource management,
 * launch validation, mission control and scoring.
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

// Create a new game
export function createGame(budget = 6000000) {
  return {
    spacecraft: createInitialSpacecraftConfig(),
    budget,
    missionState: null,
    launched: false
  };
}

// Add a component to spacecraft
export function installComponent(game, componentId) {
  return {
    ...game,
    spacecraft: addComponent(game.spacecraft, componentId)
  };
}

// Remove a component from spacecraft
export function uninstallComponent(game, componentId) {
  return {
    ...game,
    spacecraft: removeComponent(game.spacecraft, componentId)
  };
}

// Set spacecraft fuel
export function loadFuel(game, fuelKg) {
  return {
    ...game,
    spacecraft: updateFuel(game.spacecraft, fuelKg)
  };
}

// Get current spacecraft resources
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

// Start a mission after successful validation
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
    launched: true
  };

  return {
    game: updatedGame,
    success: true,
    validation
  };
}

// Complete a mission objective
export function completeGameObjective(game, objectiveId) {
  if (!game.launched || !game.missionState) {
    throw new Error("Launch the mission first.");
  }

  return {
    ...game,
    missionState: completeObjective(
      game.missionState,
      objectiveId
    )
  };
}

// Move to the next mission phase
export function moveToNextPhase(game) {
  if (!game.launched || !game.missionState) {
    throw new Error("Launch the mission first.");
  }

  return {
    ...game,
    missionState: advanceMissionPhase(game.missionState)
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

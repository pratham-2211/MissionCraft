
/**
 * MissionCraft - Mission Controller
 *
 * Manages mission definitions, phases and objectives.
 *
 * All mission limits and objectives are illustrative
 * game values, not official NASA mission specifications.
 */

// Available missions
export const MISSIONS = [
  {
    id: "earth-observation",
    name: "Earth Observation",
    description: "Observe Earth and collect scientific images.",

    maxLaunchMassKg: 1000,
    minFuelKg: 100,
    requiredPowerBalanceW: 0,

    requiredComponentIds: [
      "rocket",
      "spacecraft-bus",
      "fuel-tank",
      "solar-panel",
      "camera",
    ],

    phases: [
      "Pre-launch",
      "Launch",
      "Orbit Insertion",
      "Science Operations",
      "Mission Complete",
    ],

    objectives: [
      {
        id: "reach-orbit",
        name: "Reach Earth orbit",
        description: "Successfully enter Earth orbit.",
      },
      {
        id: "capture-images",
        name: "Capture Earth images",
        description: "Collect scientific images of Earth.",
      },
      {
        id: "send-data",
        name: "Send scientific data",
        description: "Transmit collected data to Earth.",
      },
    ],
  },

  {
    id: "lunar-survey",
    name: "Lunar Survey",
    description: "Explore the Moon and collect surface data.",

    maxLaunchMassKg: 1500,
    minFuelKg: 300,
    requiredPowerBalanceW: 0,

    requiredComponentIds: [
      "rocket",
      "spacecraft-bus",
      "fuel-tank",
      "solar-panel",
      "camera",
      "antenna",
    ],

    phases: [
      "Pre-launch",
      "Launch",
      "Trans-Lunar Travel",
      "Lunar Orbit",
      "Science Operations",
      "Mission Complete",
    ],

    objectives: [
      {
        id: "reach-moon",
        name: "Reach lunar orbit",
        description: "Travel to the Moon and enter lunar orbit.",
      },
      {
        id: "scan-surface",
        name: "Scan lunar surface",
        description: "Collect images of the lunar surface.",
      },
      {
        id: "transmit-data",
        name: "Transmit lunar data",
        description: "Send collected data back to Earth.",
      },
    ],
  },

  {
    id: "mars-exploration",
    name: "Mars Exploration",
    description: "Travel to Mars and study the planet.",

    maxLaunchMassKg: 2000,
    minFuelKg: 450,
    requiredPowerBalanceW: 0,

    requiredComponentIds: [
      "rocket",
      "spacecraft-bus",
      "fuel-tank",
      "solar-panel",
      "camera",
      "antenna",
    ],

    phases: [
      "Pre-launch",
      "Launch",
      "Interplanetary Travel",
      "Mars Arrival",
      "Science Operations",
      "Mission Complete",
    ],

    objectives: [
      {
        id: "reach-mars",
        name: "Reach Mars",
        description: "Complete the journey to Mars.",
      },
      {
        id: "study-planet",
        name: "Study Mars",
        description: "Collect scientific observations.",
      },
      {
        id: "send-mars-data",
        name: "Transmit Mars data",
        description: "Send mission data back to Earth.",
      },
    ],
  },
];

/**
 * Returns all available missions.
 *
 * @returns {Array} List of missions.
 */
export function getAvailableMissions() {
  return MISSIONS;
}

/**
 * Finds a mission using its ID.
 *
 * @param {string} missionId - Mission ID.
 * @returns {Object|null} Mission details or null.
 */
export function getMissionById(missionId) {
  return (
    MISSIONS.find((mission) => mission.id === missionId) || null
  );
}

/**
 * Creates a new mission state.
 *
 * @param {string} missionId - Selected mission ID.
 * @returns {Object} Initial mission progress.
 */
export function createMissionState(missionId) {
  const mission = getMissionById(missionId);

  if (!mission) {
    throw new Error(`Mission not found: ${missionId}`);
  }

  return {
    missionId: mission.id,
    currentPhaseIndex: 0,
    completedObjectiveIds: [],
    status: "in_progress",
  };
}

/**
 * Marks an objective as completed.
 *
 * @param {Object} state - Current mission state.
 * @param {string} objectiveId - Objective ID.
 * @returns {Object} Updated mission state.
 */
export function completeObjective(state, objectiveId) {
  const mission = getMissionById(state.missionId);

  if (!mission || state.status === "completed") {
    return state;
  }

  const objectiveExists = mission.objectives.some(
    (objective) => objective.id === objectiveId
  );

  if (!objectiveExists) {
    return state;
  }

  if (state.completedObjectiveIds.includes(objectiveId)) {
    return state;
  }

  return {
    ...state,
    completedObjectiveIds: [
      ...state.completedObjectiveIds,
      objectiveId,
    ],
  };
}

/**
 * Moves the mission to its next phase.
 *
 * @param {Object} state - Current mission state.
 * @returns {Object} Updated mission state.
 */
export function advanceMissionPhase(state) {
  const mission = getMissionById(state.missionId);

  if (!mission || state.status === "completed") {
    return state;
  }

  const lastPhaseIndex = mission.phases.length - 1;

  // Check whether all objectives are completed
  const allObjectivesCompleted = mission.objectives.every(
    (objective) =>
      state.completedObjectiveIds.includes(objective.id)
  );

  // Complete mission only after all objectives are done
  if (state.currentPhaseIndex >= lastPhaseIndex) {
    if (allObjectivesCompleted) {
      return {
        ...state,
        status: "completed",
      };
    }

    return state;
  }

  return {
    ...state,
    currentPhaseIndex: state.currentPhaseIndex + 1,
  };
}

/**
 * Gets the current mission progress.
 *
 * @param {Object} state - Current mission state.
 * @returns {Object|null} Mission progress details.
 */
export function getMissionProgress(state) {
  const mission = getMissionById(state.missionId);

  if (!mission) {
    return null;
  }

  const completedCount = state.completedObjectiveIds.length;

  return {
    missionName: mission.name,
    currentPhase: mission.phases[state.currentPhaseIndex],
    totalPhases: mission.phases.length,
    completedObjectives: completedCount,
    totalObjectives: mission.objectives.length,
    progressPercentage: Math.round(
      (completedCount / mission.objectives.length) * 100
    ),
    status: state.status,
  };
}

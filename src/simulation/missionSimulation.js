
/**
 * MissionCraft - Mission Resource Simulation
 *
 * Handles fuel consumption, solar power generation,
 * battery charging/discharging and mission failures.
 *
 * All values are illustrative game values.
 */

import { getSelectedComponents } from "./spacecraftConfig.js";
import { getMissionById } from "./missionController.js";

export const PHASE_RESOURCE_SETTINGS = {
  "Pre-launch": {
    durationHours: 1,
    fuelConsumptionKg: 0,
    extraPowerConsumptionW: 20
  },
  "Launch": {
    durationHours: 0.5,
    fuelConsumptionKg: 30,
    extraPowerConsumptionW: 50
  },
  "Orbit Insertion": {
    durationHours: 1,
    fuelConsumptionKg: 20,
    extraPowerConsumptionW: 30
  },
  "Trans-Lunar Travel": {
    durationHours: 5,
    fuelConsumptionKg: 50,
    extraPowerConsumptionW: 30
  },
  "Lunar Orbit": {
    durationHours: 2,
    fuelConsumptionKg: 25,
    extraPowerConsumptionW: 20
  },
  "Interplanetary Travel": {
    durationHours: 10,
    fuelConsumptionKg: 100,
    extraPowerConsumptionW: 40
  },
  "Mars Arrival": {
    durationHours: 3,
    fuelConsumptionKg: 60,
    extraPowerConsumptionW: 40
  },
  "Science Operations": {
    durationHours: 2,
    fuelConsumptionKg: 5,
    extraPowerConsumptionW: 20
  },
  "Mission Complete": {
    durationHours: 0,
    fuelConsumptionKg: 0,
    extraPowerConsumptionW: 0
  }
};

// Create initial simulation state
export function createSimulationState(spacecraft) {
  return {
    fuelRemainingKg: spacecraft.fuelKg || 0,
    batteryEnergyWh: 0,
    elapsedHours: 0,
    history: [],
    status: "ready"
  };
}

// Simulate one mission phase
export function simulateMissionPhase(
  spacecraft,
  missionState,
  simulationState
) {
  if (
    simulationState.status !== "ready" &&
    simulationState.status !== "in_progress"
  ) {
    throw new Error("Simulation is not active.");
  }

  const mission = getMissionById(missionState.missionId);

  if (!mission) {
    throw new Error("Mission not found.");
  }

  const phaseName =
    mission.phases[missionState.currentPhaseIndex];

  const settings = PHASE_RESOURCE_SETTINGS[phaseName];

  if (!settings) {
    throw new Error(
      `Resource settings missing for phase: ${phaseName}`
    );
  }

  const components = getSelectedComponents(spacecraft);

  const powerGenerationW = components.reduce(
    (total, component) =>
      total + (component.powerGenerationW || 0),
    0
  );

  const componentPowerConsumptionW = components.reduce(
    (total, component) =>
      total + (component.powerConsumptionW || 0),
    0
  );

  const totalPowerConsumptionW =
    componentPowerConsumptionW +
    settings.extraPowerConsumptionW;

  const generatedEnergyWh =
    powerGenerationW * settings.durationHours;

  const consumedEnergyWh =
    totalPowerConsumptionW * settings.durationHours;

  const fuelRequiredKg = settings.fuelConsumptionKg;

  // Check fuel availability
  if (simulationState.fuelRemainingKg < fuelRequiredKg) {
    return {
      success: false,
      reason: "Insufficient fuel",
      simulationState: {
        ...simulationState,
        status: "failed"
      }
    };
  }

  // Find battery
  const batteryComponent = components.find(
    (component) => component.batteryCapacityWh
  );

  const batteryCapacityWh =
    batteryComponent?.batteryCapacityWh || 0;

  // Calculate available electrical energy
  const availableEnergyWh =
    simulationState.batteryEnergyWh + generatedEnergyWh;

  // Check whether energy is sufficient
  if (availableEnergyWh < consumedEnergyWh) {
    return {
      success: false,
      reason: "Insufficient electrical energy",
      simulationState: {
        ...simulationState,
        status: "failed"
      }
    };
  }

  // Update battery after consumption
  const batteryEnergyWh = Math.min(
    batteryCapacityWh,
    availableEnergyWh - consumedEnergyWh
  );

  // Update fuel
  const fuelRemainingKg =
    simulationState.fuelRemainingKg - fuelRequiredKg;

  // Create updated simulation state
  const updatedState = {
    fuelRemainingKg,
    batteryEnergyWh,
    elapsedHours:
      simulationState.elapsedHours + settings.durationHours,

    history: [
      ...simulationState.history,
      {
        phase: phaseName,
        durationHours: settings.durationHours,
        fuelConsumedKg: fuelRequiredKg,
        fuelRemainingKg,
        powerGeneratedWh: generatedEnergyWh,
        powerConsumedWh: consumedEnergyWh,
        batteryRemainingWh: batteryEnergyWh
      }
    ],

    status: "in_progress"
  };

  return {
    success: true,
    reason: null,
    phase: phaseName,
    simulationState: updatedState
  };
}

// Get simulation summary
export function getSimulationSummary(simulationState) {
  return {
    fuelRemainingKg: simulationState.fuelRemainingKg,
    batteryEnergyWh: simulationState.batteryEnergyWh,
    elapsedHours: simulationState.elapsedHours,
    completedPhases: simulationState.history.length,
    status: simulationState.status,
    history: simulationState.history
  };
}

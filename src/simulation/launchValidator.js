
/**
 * MissionCraft - Launch Validator
 *
 * Checks whether a spacecraft is ready for launch.
 *
 * All limits are illustrative game rules,
 * not official NASA launch requirements.
 */

import { calculateResources } from "./resourceManager.js";

/**
 * Validates spacecraft launch readiness.
 *
 * @param {Object} config - Spacecraft configuration.
 * @param {Object} mission - Mission requirements.
 * @param {number} budgetCredits - Available mission budget.
 * @returns {Object} Launch validation result.
 */
export function validateLaunch(
  config,
  mission = {},
  budgetCredits = 6000000
) {
  const resources = calculateResources(config, budgetCredits);

  const errors = [];
  const warnings = [];

  const selectedIds = config.selectedComponentIds || [];

  // 1. Check launch vehicle
  if (!selectedIds.includes("rocket")) {
    errors.push("Launch vehicle is missing.");
  }

  // 2. Check required mission components
  const requiredComponents = mission.requiredComponentIds || [];

  requiredComponents.forEach((componentId) => {
    if (!selectedIds.includes(componentId)) {
      errors.push(`Required component missing: ${componentId}`);
    }
  });

  // 3. Check mission budget
  if (resources.remainingBudget < 0) {
    errors.push("Mission budget exceeded.");
  }

  // 4. Calculate total launch mass
  const launchMassKg = resources.totalMassKg + resources.fuelKg;

  if (
    Number.isFinite(mission.maxLaunchMassKg) &&
    launchMassKg > mission.maxLaunchMassKg
  ) {
    errors.push("Spacecraft exceeds the maximum launch mass.");
  }

  // 5. Check fuel tank capacity
  if (resources.remainingFuelCapacityKg < 0) {
    errors.push("Loaded fuel exceeds tank capacity.");
  }

  // 6. Check minimum fuel required
  const minFuelKg = mission.minFuelKg || 0;

  if (resources.fuelKg < minFuelKg) {
    errors.push("Insufficient fuel for the mission.");
  }

  // 7. Check power balance
  const requiredPowerBalanceW =
    mission.requiredPowerBalanceW || 0;

  if (resources.powerBalanceW < requiredPowerBalanceW) {
    errors.push("Insufficient power for the mission.");
  }

  // 8. Check battery
  if (resources.batteryCapacityWh === 0) {
    warnings.push("No battery installed.");
  }

  // 9. Final launch decision
  const ready = errors.length === 0;

  return {
    ready,
    status: ready ? "READY" : "NOT READY",
    launchMassKg,
    errors,
    warnings,
    resources
  };
}

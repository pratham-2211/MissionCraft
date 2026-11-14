
import { getSelectedComponents } from "./spacecraftConfig.js";

/**
 * Calculates all spacecraft resources.
 *
 * @param {Object} config - Spacecraft configuration.
 * @param {number} budget - Total mission budget.
 * @returns {Object} Calculated resource details.
 */
export function calculateResources(config, budget = 10000000) {
  const components = getSelectedComponents(config);

  const totalCost = components.reduce(
    (total, component) => total + component.cost,
    0
  );

  const totalMassKg = components.reduce(
    (total, component) => total + component.massKg,
    0
  );

  const fuelCapacityKg = components.reduce(
    (total, component) => total + (component.fuelCapacityKg || 0),
    0
  );

  const fuelKg = config.fuelKg || 0;

  const powerGenerationW = components.reduce(
    (total, component) => total + (component.powerGenerationW || 0),
    0
  );

  const powerConsumptionW = components.reduce(
    (total, component) => total + (component.powerConsumptionW || 0),
    0
  );

  const batteryCapacityWh = components.reduce(
    (total, component) => total + (component.batteryCapacityWh || 0),
    0
  );

  return {
    totalCost,
    remainingBudget: budget - totalCost,

    totalMassKg,

    fuelCapacityKg,
    fuelKg,
    remainingFuelCapacityKg: fuelCapacityKg - fuelKg,

    powerGenerationW,
    powerConsumptionW,
    powerBalanceW: powerGenerationW - powerConsumptionW,

    batteryCapacityWh
  };
}

/**
 * Checks whether the spacecraft has enough budget.
 *
 * @param {Object} resources - Calculated resource details.
 * @returns {boolean} True if budget is sufficient.
 */
export function hasEnoughBudget(resources) {
  return resources.remainingBudget >= 0;
}

/**
 * Checks whether fuel is within tank capacity.
 *
 * @param {Object} resources - Calculated resource details.
 * @returns {boolean} True if fuel is within capacity.
 */
export function hasValidFuelCapacity(resources) {
  return (
    resources.fuelKg >= 0 &&
    resources.remainingFuelCapacityKg >= 0
  );
}

/**
 * Checks whether power generation meets power consumption.
 *
 * @param {Object} resources - Calculated resource details.
 * @returns {boolean} True if power balance is non-negative.
 */
export function hasEnoughPower(resources) {
  return resources.powerBalanceW >= 0;
}

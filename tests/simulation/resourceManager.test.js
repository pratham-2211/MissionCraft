import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  calculateResources,
  hasEnoughBudget,
  hasValidFuelCapacity,
  hasEnoughPower
} from "../../src/simulation/resourceManager.js";
import {
  createInitialSpacecraftConfig,
  addComponent,
  updateFuel
} from "../../src/simulation/spacecraftConfig.js";

describe("Resource Manager", () => {
  test("calculateResources correctly aggregates mass, cost, power, and capacity", () => {
    let config = createInitialSpacecraftConfig();
    config = addComponent(config, "spacecraft-bus"); // cost: 200k, mass: 150kg
    config = addComponent(config, "fuel-tank");      // cost: 100k, mass: 50kg, fuelCap: 500kg
    config = addComponent(config, "solar-panel");    // cost: 80k,  mass: 20kg, gen: 500W
    config = addComponent(config, "camera");         // cost: 60k,  mass: 10kg, cons: 100W
    config = updateFuel(config, 200);

    const resources = calculateResources(config, 6000000);

    assert.strictEqual(resources.totalCost, 440000);
    assert.strictEqual(resources.remainingBudget, 5560000);
    assert.strictEqual(resources.totalMassKg, 230);
    assert.strictEqual(resources.fuelCapacityKg, 500);
    assert.strictEqual(resources.fuelKg, 200);
    assert.strictEqual(resources.remainingFuelCapacityKg, 300);
    assert.strictEqual(resources.powerGenerationW, 500);
    assert.strictEqual(resources.powerConsumptionW, 100);
    assert.strictEqual(resources.powerBalanceW, 400);
    assert.strictEqual(resources.batteryCapacityWh, 0);
  });

  test("hasEnoughBudget checks budget constraint", () => {
    assert.strictEqual(hasEnoughBudget({ remainingBudget: 100 }), true);
    assert.strictEqual(hasEnoughBudget({ remainingBudget: 0 }), true);
    assert.strictEqual(hasEnoughBudget({ remainingBudget: -1 }), false);
  });

  test("hasValidFuelCapacity checks fuel tank boundaries", () => {
    assert.strictEqual(
      hasValidFuelCapacity({ fuelKg: 100, remainingFuelCapacityKg: 50 }),
      true
    );
    assert.strictEqual(
      hasValidFuelCapacity({ fuelKg: -5, remainingFuelCapacityKg: 50 }),
      false
    );
    assert.strictEqual(
      hasValidFuelCapacity({ fuelKg: 100, remainingFuelCapacityKg: -10 }),
      false
    );
  });

  test("hasEnoughPower checks power balance", () => {
    assert.strictEqual(hasEnoughPower({ powerBalanceW: 50 }), true);
    assert.strictEqual(hasEnoughPower({ powerBalanceW: 0 }), true);
    assert.strictEqual(hasEnoughPower({ powerBalanceW: -1 }), false);
  });
});

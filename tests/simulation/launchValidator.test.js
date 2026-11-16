import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { validateLaunch } from "../../src/simulation/launchValidator.js";
import { getMissionById } from "../../src/simulation/missionController.js";
import {
  createInitialSpacecraftConfig,
  addComponent,
  updateFuel
} from "../../src/simulation/spacecraftConfig.js";

describe("Launch Validator", () => {
  const mission = getMissionById("earth-observation");

  test("produces a single launch vehicle error when rocket is missing (no duplicate error)", () => {
    let config = createInitialSpacecraftConfig();
    config = addComponent(config, "spacecraft-bus");
    config = addComponent(config, "fuel-tank");
    config = addComponent(config, "solar-panel");
    config = addComponent(config, "camera");
    config = updateFuel(config, 150);

    const result = validateLaunch(config, mission, 6000000);

    assert.strictEqual(result.ready, false);
    assert.strictEqual(result.status, "NOT READY");

    // Exactly one error for the rocket: "Launch vehicle is missing."
    const rocketErrors = result.errors.filter((e) =>
      e.toLowerCase().includes("rocket") || e.toLowerCase().includes("launch vehicle")
    );
    assert.strictEqual(
      rocketErrors.length,
      1,
      "Expected exactly 1 rocket/launch vehicle error"
    );
    assert.strictEqual(rocketErrors[0], "Launch vehicle is missing.");
  });

  test("rejects launch when required mission components are missing", () => {
    let config = createInitialSpacecraftConfig();
    config = addComponent(config, "rocket");
    config = addComponent(config, "spacecraft-bus");
    config = addComponent(config, "fuel-tank");
    config = addComponent(config, "solar-panel");
    // missing "camera"
    config = updateFuel(config, 150);

    const result = validateLaunch(config, mission, 6000000);
    assert.strictEqual(result.ready, false);
    assert.ok(
      result.errors.includes("Required component missing: camera"),
      "Should report missing camera"
    );
  });

  test("rejects launch when budget is exceeded", () => {
    let config = createInitialSpacecraftConfig();
    config = addComponent(config, "rocket"); // 5,000,000
    config = addComponent(config, "spacecraft-bus"); // 200,000
    config = addComponent(config, "fuel-tank");
    config = addComponent(config, "solar-panel");
    config = addComponent(config, "camera");
    config = updateFuel(config, 150);

    // Budget of only 4,000,000
    const result = validateLaunch(config, mission, 4000000);
    assert.strictEqual(result.ready, false);
    assert.ok(result.errors.includes("Mission budget exceeded."));
  });

  test("rejects launch when total mass exceeds mission maxLaunchMassKg", () => {
    let config = createInitialSpacecraftConfig();
    config = addComponent(config, "rocket");
    config = addComponent(config, "spacecraft-bus");
    config = addComponent(config, "fuel-tank");
    config = addComponent(config, "solar-panel");
    config = addComponent(config, "camera");

    // earth-observation maxLaunchMassKg is 1000 kg.
    // Spacecraft dry mass: 150 + 50 + 20 + 10 = 230 kg.
    // Setting fuel to 800 kg gives 1030 kg total mass > 1000 kg.
    // But fuel tank max is 500 kg, so loaded fuel also exceeds tank capacity.
    const customMission = {
      ...mission,
      maxLaunchMassKg: 300,
      minFuelKg: 50
    };
    config = updateFuel(config, 100); // 230 + 100 = 330 kg > 300 kg

    const result = validateLaunch(config, customMission, 6000000);
    assert.strictEqual(result.ready, false);
    assert.ok(
      result.errors.includes("Spacecraft exceeds the maximum launch mass.")
    );
  });

  test("rejects launch when fuel is below mission minFuelKg", () => {
    let config = createInitialSpacecraftConfig();
    config = addComponent(config, "rocket");
    config = addComponent(config, "spacecraft-bus");
    config = addComponent(config, "fuel-tank");
    config = addComponent(config, "solar-panel");
    config = addComponent(config, "camera");
    config = updateFuel(config, 50); // minFuelKg is 100

    const result = validateLaunch(config, mission, 6000000);
    assert.strictEqual(result.ready, false);
    assert.ok(result.errors.includes("Insufficient fuel for the mission."));
  });

  test("rejects launch when loaded fuel exceeds tank capacity", () => {
    let config = createInitialSpacecraftConfig();
    config = addComponent(config, "rocket");
    config = addComponent(config, "spacecraft-bus");
    config = addComponent(config, "fuel-tank"); // capacity: 500 kg
    config = addComponent(config, "solar-panel");
    config = addComponent(config, "camera");
    config = updateFuel(config, 550);

    const result = validateLaunch(config, mission, 6000000);
    assert.strictEqual(result.ready, false);
    assert.ok(result.errors.includes("Loaded fuel exceeds tank capacity."));
  });

  test("issues warning when no battery is installed without blocking launch if other criteria met", () => {
    let config = createInitialSpacecraftConfig();
    config = addComponent(config, "rocket");
    config = addComponent(config, "spacecraft-bus");
    config = addComponent(config, "fuel-tank");
    config = addComponent(config, "solar-panel");
    config = addComponent(config, "camera");
    config = updateFuel(config, 150);

    const result = validateLaunch(config, mission, 6000000);
    assert.strictEqual(result.ready, true);
    assert.strictEqual(result.status, "READY");
    assert.ok(result.warnings.includes("No battery installed."));
  });

  test("approves launch when all criteria and battery are satisfied", () => {
    let config = createInitialSpacecraftConfig();
    config = addComponent(config, "rocket");
    config = addComponent(config, "spacecraft-bus");
    config = addComponent(config, "fuel-tank");
    config = addComponent(config, "solar-panel");
    config = addComponent(config, "battery");
    config = addComponent(config, "camera");
    config = updateFuel(config, 200);

    const result = validateLaunch(config, mission, 6000000);
    assert.strictEqual(result.ready, true);
    assert.strictEqual(result.status, "READY");
    assert.strictEqual(result.errors.length, 0);
    assert.strictEqual(result.warnings.length, 0);
  });
});

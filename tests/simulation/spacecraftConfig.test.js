import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  COMPONENT_CATALOG,
  createInitialSpacecraftConfig,
  addComponent,
  removeComponent,
  updateFuel,
  getSelectedComponents
} from "../../src/simulation/spacecraftConfig.js";

describe("Spacecraft Configuration", () => {
  test("COMPONENT_CATALOG contains expected components with valid properties", () => {
    assert.ok(Array.isArray(COMPONENT_CATALOG));
    assert.ok(COMPONENT_CATALOG.length >= 7);

    for (const comp of COMPONENT_CATALOG) {
      assert.ok(comp.id, "Component must have an id");
      assert.ok(comp.name, "Component must have a name");
      assert.ok(comp.category, "Component must have a category");
      assert.ok(typeof comp.cost === "number" && comp.cost >= 0);
      assert.ok(typeof comp.massKg === "number" && comp.massKg >= 0);
    }
  });

  test("createInitialSpacecraftConfig initializes clean default state", () => {
    const config = createInitialSpacecraftConfig();
    assert.strictEqual(config.name, "My Spacecraft");
    assert.deepStrictEqual(config.selectedComponentIds, []);
    assert.strictEqual(config.fuelKg, 0);
  });

  test("addComponent installs component and preserves immutability", () => {
    const config = createInitialSpacecraftConfig();
    const updated = addComponent(config, "rocket");

    assert.notStrictEqual(config, updated);
    assert.deepStrictEqual(config.selectedComponentIds, []);
    assert.deepStrictEqual(updated.selectedComponentIds, ["rocket"]);
  });

  test("addComponent throws for unrecognized component id", () => {
    const config = createInitialSpacecraftConfig();
    assert.throws(
      () => addComponent(config, "warp-drive"),
      /Component not found: warp-drive/
    );
  });

  test("addComponent is idempotent and does not add duplicates", () => {
    let config = createInitialSpacecraftConfig();
    config = addComponent(config, "solar-panel");
    const same = addComponent(config, "solar-panel");

    assert.strictEqual(config, same);
    assert.deepStrictEqual(config.selectedComponentIds, ["solar-panel"]);
  });

  test("removeComponent removes selected component", () => {
    let config = createInitialSpacecraftConfig();
    config = addComponent(config, "rocket");
    config = addComponent(config, "camera");

    const updated = removeComponent(config, "camera");
    assert.deepStrictEqual(updated.selectedComponentIds, ["rocket"]);

    // Removing non-installed component does not fail
    const unchanged = removeComponent(updated, "antenna");
    assert.deepStrictEqual(unchanged.selectedComponentIds, ["rocket"]);
  });

  test("updateFuel updates fuel quantity with valid non-negative numbers", () => {
    const config = createInitialSpacecraftConfig();
    const updated = updateFuel(config, 250);
    assert.strictEqual(updated.fuelKg, 250);
  });

  test("updateFuel rejects negative or non-finite numbers", () => {
    const config = createInitialSpacecraftConfig();
    assert.throws(
      () => updateFuel(config, -10),
      /Fuel must be a valid non-negative number/
    );
    assert.throws(
      () => updateFuel(config, NaN),
      /Fuel must be a valid non-negative number/
    );
    assert.throws(
      () => updateFuel(config, Infinity),
      /Fuel must be a valid non-negative number/
    );
  });

  test("getSelectedComponents returns matching catalog items", () => {
    let config = createInitialSpacecraftConfig();
    config = addComponent(config, "rocket");
    config = addComponent(config, "battery");

    const selected = getSelectedComponents(config);
    assert.strictEqual(selected.length, 2);
    assert.ok(selected.some((c) => c.id === "rocket"));
    assert.ok(selected.some((c) => c.id === "battery"));
  });
});

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  MISSIONS,
  getAvailableMissions,
  getMissionById,
  createMissionState,
  completeObjective,
  advanceMissionPhase,
  getMissionProgress
} from "../../src/simulation/missionController.js";

describe("Mission Controller", () => {
  test("getAvailableMissions and getMissionById return mission definitions", () => {
    const list = getAvailableMissions();
    assert.strictEqual(list, MISSIONS);
    assert.ok(Array.isArray(list));
    assert.strictEqual(list.length, 3);

    const earth = getMissionById("earth-observation");
    assert.ok(earth);
    assert.strictEqual(earth.name, "Earth Observation");
    assert.ok(Array.isArray(earth.phases));
    assert.ok(Array.isArray(earth.objectives));

    const invalid = getMissionById("pluto-flyby");
    assert.strictEqual(invalid, null);
  });

  test("createMissionState initializes with zero completed objectives", () => {
    const state = createMissionState("earth-observation");
    assert.strictEqual(state.missionId, "earth-observation");
    assert.strictEqual(state.currentPhaseIndex, 0);
    assert.deepStrictEqual(state.completedObjectiveIds, []);
    assert.strictEqual(state.status, "in_progress");

    // Verify initial progress calculation
    const progress = getMissionProgress(state);
    assert.strictEqual(progress.completedObjectives, 0);
    assert.strictEqual(progress.totalObjectives, 3);
    assert.strictEqual(progress.progressPercentage, 0);
    assert.strictEqual(progress.status, "in_progress");
  });

  test("createMissionState throws for invalid mission id", () => {
    assert.throws(
      () => createMissionState("invalid-id"),
      /Mission not found: invalid-id/
    );
  });

  test("completeObjective marks an existing objective complete", () => {
    let state = createMissionState("earth-observation");
    state = completeObjective(state, "reach-orbit");

    assert.deepStrictEqual(state.completedObjectiveIds, ["reach-orbit"]);
    const progress = getMissionProgress(state);
    assert.strictEqual(progress.completedObjectives, 1);
    assert.strictEqual(progress.progressPercentage, 33);
  });

  test("completeObjective rejects duplicate objective completion without modifying state", () => {
    let state = createMissionState("earth-observation");
    state = completeObjective(state, "reach-orbit");
    const same = completeObjective(state, "reach-orbit");

    assert.strictEqual(same, state);
    assert.deepStrictEqual(same.completedObjectiveIds, ["reach-orbit"]);
  });

  test("completeObjective rejects invalid objective ID without modifying state", () => {
    let state = createMissionState("earth-observation");
    const same = completeObjective(state, "non-existent-objective");

    assert.strictEqual(same, state);
    assert.deepStrictEqual(same.completedObjectiveIds, []);
  });

  test("completeObjective rejects completion when mission is completed or failed", () => {
    const completedState = {
      missionId: "earth-observation",
      currentPhaseIndex: 4,
      completedObjectiveIds: ["reach-orbit"],
      status: "completed"
    };
    const unchangedCompleted = completeObjective(completedState, "capture-images");
    assert.strictEqual(unchangedCompleted, completedState);

    const failedState = {
      missionId: "earth-observation",
      currentPhaseIndex: 1,
      completedObjectiveIds: ["reach-orbit"],
      status: "failed"
    };
    const unchangedFailed = completeObjective(failedState, "capture-images");
    assert.strictEqual(unchangedFailed, failedState);
  });

  test("advanceMissionPhase steps through phases sequentially", () => {
    let state = createMissionState("earth-observation");
    assert.strictEqual(state.currentPhaseIndex, 0);

    state = advanceMissionPhase(state);
    assert.strictEqual(state.currentPhaseIndex, 1);

    state = advanceMissionPhase(state);
    assert.strictEqual(state.currentPhaseIndex, 2);
  });

  test("advanceMissionPhase completes mission when all objectives met at final phase", () => {
    let state = createMissionState("earth-observation");
    state = completeObjective(state, "reach-orbit");
    state = completeObjective(state, "capture-images");
    state = completeObjective(state, "send-data");

    // Advance to final phase (earth-observation has 5 phases, index 0 to 4)
    state = advanceMissionPhase(state); // to 1
    state = advanceMissionPhase(state); // to 2
    state = advanceMissionPhase(state); // to 3
    state = advanceMissionPhase(state); // to 4 ("Mission Complete")
    assert.strictEqual(state.currentPhaseIndex, 4);
    assert.strictEqual(state.status, "in_progress");

    // Terminal phase advancement resolves to "completed"
    state = advanceMissionPhase(state);
    assert.strictEqual(state.status, "completed");

    // Further calls on completed mission do not modify state
    const postComplete = advanceMissionPhase(state);
    assert.strictEqual(postComplete, state);
  });

  test("advanceMissionPhase explicitly fails mission when objectives incomplete at final phase", () => {
    let state = createMissionState("earth-observation");
    // Only 1 of 3 objectives completed
    state = completeObjective(state, "reach-orbit");

    state = advanceMissionPhase(state); // 1
    state = advanceMissionPhase(state); // 2
    state = advanceMissionPhase(state); // 3
    state = advanceMissionPhase(state); // 4 ("Mission Complete")
    assert.strictEqual(state.currentPhaseIndex, 4);
    assert.strictEqual(state.status, "in_progress");

    // Resolving terminal phase with incomplete objectives terminates loop and marks failed
    state = advanceMissionPhase(state);
    assert.strictEqual(state.status, "failed");

    // Further calls on failed mission do not modify state or advance indefinitely
    const postFailed = advanceMissionPhase(state);
    assert.strictEqual(postFailed, state);
  });

  test("getMissionProgress defensively handles malformed state", () => {
    assert.strictEqual(getMissionProgress(null), null);
    assert.strictEqual(getMissionProgress({ missionId: "unknown" }), null);

    const malformedState = {
      missionId: "earth-observation",
      currentPhaseIndex: 0,
      completedObjectiveIds: undefined,
      status: "in_progress"
    };
    const progress = getMissionProgress(malformedState);
    assert.strictEqual(progress.completedObjectives, 0);
    assert.strictEqual(progress.progressPercentage, 0);
  });
});

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  calculateMissionScore,
  getPerformanceRating,
  getMissionResult
} from "../../src/simulation/scoring.js";

describe("Scoring System", () => {
  test("calculates score correctly with objectives and completion bonus", () => {
    const completedState = {
      completedObjectiveIds: ["reach-orbit", "capture-images", "send-data"],
      status: "completed"
    };

    const score = calculateMissionScore(completedState);
    assert.strictEqual(score.objectiveScore, 300);
    assert.strictEqual(score.completionBonus, 200);
    assert.strictEqual(score.totalScore, 500);
    assert.strictEqual(score.completedObjectives, 3);
    assert.strictEqual(score.status, "completed");
  });

  test("does not award completion bonus for in-progress or failed missions", () => {
    const inProgressState = {
      completedObjectiveIds: ["reach-orbit"],
      status: "in_progress"
    };
    const inProgressScore = calculateMissionScore(inProgressState);
    assert.strictEqual(inProgressScore.objectiveScore, 100);
    assert.strictEqual(inProgressScore.completionBonus, 0);
    assert.strictEqual(inProgressScore.totalScore, 100);

    const failedState = {
      completedObjectiveIds: ["reach-orbit", "capture-images"],
      status: "failed"
    };
    const failedScore = calculateMissionScore(failedState);
    assert.strictEqual(failedScore.objectiveScore, 200);
    assert.strictEqual(failedScore.completionBonus, 0);
    assert.strictEqual(failedScore.totalScore, 200);
  });

  test("duplicate objective IDs do not inflate score", () => {
    const stateWithDuplicates = {
      completedObjectiveIds: ["reach-orbit", "reach-orbit", "reach-orbit"],
      status: "in_progress"
    };

    const score = calculateMissionScore(stateWithDuplicates);
    assert.strictEqual(score.completedObjectives, 1);
    assert.strictEqual(score.objectiveScore, 100);
    assert.strictEqual(score.totalScore, 100);
  });

  test("getPerformanceRating returns expected tier descriptions", () => {
    assert.strictEqual(getPerformanceRating(500), "Excellent");
    assert.strictEqual(getPerformanceRating(600), "Excellent");
    assert.strictEqual(getPerformanceRating(300), "Good");
    assert.strictEqual(getPerformanceRating(450), "Good");
    assert.strictEqual(getPerformanceRating(100), "Average");
    assert.strictEqual(getPerformanceRating(250), "Average");
    assert.strictEqual(getPerformanceRating(0), "Needs Improvement");
    assert.strictEqual(getPerformanceRating(99), "Needs Improvement");
  });

  test("getPerformanceRating throws for non-finite or negative scores", () => {
    assert.throws(
      () => getPerformanceRating(-10),
      /Score must be a valid non-negative number/
    );
    assert.throws(
      () => getPerformanceRating(NaN),
      /Score must be a valid non-negative number/
    );
    assert.throws(
      () => getPerformanceRating("100"),
      /Score must be a valid non-negative number/
    );
  });

  test("getMissionResult builds complete mission result payload", () => {
    const completedState = {
      completedObjectiveIds: ["reach-orbit", "capture-images", "send-data"],
      status: "completed"
    };

    const result = getMissionResult(completedState);
    assert.strictEqual(result.totalScore, 500);
    assert.strictEqual(result.rating, "Excellent");
    assert.strictEqual(result.successful, true);

    const failedState = {
      completedObjectiveIds: ["reach-orbit"],
      status: "failed"
    };
    const failedResult = getMissionResult(failedState);
    assert.strictEqual(failedResult.totalScore, 100);
    assert.strictEqual(failedResult.rating, "Average");
    assert.strictEqual(failedResult.successful, false);
  });
});


/**
 * MissionCraft - Scoring System
 *
 * Calculates mission score based on completed objectives
 * and mission performance.
 *
 * Scores are illustrative game values, not real NASA ratings.
 */

// Points awarded for each completed objective
const POINTS_PER_OBJECTIVE = 100;

// Bonus points for completing the mission
const MISSION_COMPLETION_BONUS = 200;

/**
 * Calculates the mission score.
 *
 * @param {Object} missionState - Current mission state.
 * @returns {Object} Score details.
 */
export function calculateMissionScore(missionState) {
  if (!missionState) {
    throw new Error("Mission state is required.");
  }

  const rawCompleted =
    missionState.completedObjectiveIds || [];

  // Guarantee duplicate objective IDs do not inflate score
  const uniqueObjectives = [...new Set(rawCompleted)];

  const objectiveScore =
    uniqueObjectives.length * POINTS_PER_OBJECTIVE;

  const completionBonus =
    missionState.status === "completed"
      ? MISSION_COMPLETION_BONUS
      : 0;

  const totalScore = objectiveScore + completionBonus;

  return {
    objectiveScore,
    completionBonus,
    totalScore,
    completedObjectives: uniqueObjectives.length,
    status: missionState.status
  };
}

/**
 * Returns a performance rating based on score.
 *
 * @param {number} score - Total mission score.
 * @returns {string} Performance rating.
 */
export function getPerformanceRating(score) {
  if (!Number.isFinite(score) || score < 0) {
    throw new Error("Score must be a valid non-negative number.");
  }

  if (score >= 500) return "Excellent";
  if (score >= 300) return "Good";
  if (score >= 100) return "Average";

  return "Needs Improvement";
}

/**
 * Creates a mission result summary.
 *
 * @param {Object} missionState - Current mission state.
 * @returns {Object} Mission result summary.
 */
export function getMissionResult(missionState) {
  const scoreDetails = calculateMissionScore(missionState);

  return {
    ...scoreDetails,
    rating: getPerformanceRating(scoreDetails.totalScore),
    successful: missionState.status === "completed"
  };
}

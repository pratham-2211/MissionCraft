import { useState, useCallback, useMemo } from "react";
import {
  createGame,
  installComponent,
  uninstallComponent,
  loadFuel,
  getGameResources,
  checkLaunchReadiness,
  launchMission,
  completeGameObjective,
  moveToNextPhase,
  getGameProgress,
  getGameScore,
  getFinalMissionResult,
} from "../simulation/gameEngine.js";
import { COMPONENT_CATALOG } from "../simulation/spacecraftConfig.js";
import { MISSIONS, getMissionById } from "../simulation/missionController.js";
import { getPerformanceRating } from "../simulation/scoring.js";

const HISTORY_STORAGE_KEY = "missioncraft_flight_history_v2";

function loadSavedHistory() {
  if (typeof window === "undefined" || !window.localStorage) {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(HISTORY_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error("Failed to load flight history from storage:", err);
  }
  return [];
}

function persistHistory(list) {
  if (typeof window === "undefined" || !window.localStorage) {
    return;
  }
  try {
    window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.error("Failed to persist flight history to storage:", err);
  }
}

export function useMissionCraftGame() {
  // Current screen state
  // Valid screen IDs:
  // 'command-center', 'missions', 'designer', 'resources', 'readiness', 'mission-control', 'simulation-hud', 'results', 'history'
  const [currentScreen, setCurrentScreen] = useState("command-center");

  // Selected mission ID: 'lunar-survey', 'mars-exploration', 'earth-observation'
  const [activeMissionId, setActiveMissionId] = useState("lunar-survey");

  // Game instance initialized with $6,000,000 budget
  const [game, setGame] = useState(() => {
    let initialGame = createGame(6000000);
    // Pre-install basic components for convenience: rocket, spacecraft-bus, fuel-tank, solar-panel
    initialGame = installComponent(initialGame, "rocket");
    initialGame = installComponent(initialGame, "spacecraft-bus");
    initialGame = installComponent(initialGame, "fuel-tank");
    initialGame = installComponent(initialGame, "solar-panel");
    initialGame = loadFuel(initialGame, 320);
    return initialGame;
  });

  // Saved flight history - starts empty or loads genuine completed missions
  const [historyList, setHistoryList] = useState(loadSavedHistory);

  // Notifications
  const [notification, setNotification] = useState("");

  // Get active mission definition
  const activeMission = useMemo(() => {
    return getMissionById(activeMissionId) || MISSIONS[0];
  }, [activeMissionId]);

  // Derived real game resources from gameEngine
  const resources = useMemo(() => {
    return getGameResources(game);
  }, [game]);

  // Derived launch readiness verification from gameEngine
  const readiness = useMemo(() => {
    try {
      return checkLaunchReadiness(game, activeMissionId);
    } catch {
      return {
        ready: false,
        status: "NOT READY",
        launchMassKg: 0,
        errors: ["Validation failed"],
        warnings: [],
        resources,
      };
    }
  }, [game, activeMissionId, resources]);

  // Derived mission progress if mission is launched
  const progress = useMemo(() => {
    return getGameProgress(game);
  }, [game]);

  // Derived score
  const score = useMemo(() => {
    return getGameScore(game);
  }, [game]);

  // Derived final result
  const finalResult = useMemo(() => {
    return getFinalMissionResult(game);
  }, [game]);

  // Actions
  const handleSelectMission = useCallback((missionId) => {
    setActiveMissionId(missionId);
    const mission = getMissionById(missionId);
    setNotification(
      `MISSION SELECTED: ${mission ? mission.name.toUpperCase() : missionId}`
    );
  }, []);

  const handleInstallComponent = useCallback((componentId) => {
    setGame((prevGame) => {
      try {
        const next = installComponent(prevGame, componentId);
        return next;
      } catch (err) {
        console.error(err);
        return prevGame;
      }
    });
  }, []);

  const handleUninstallComponent = useCallback((componentId) => {
    setGame((prevGame) => {
      try {
        const next = uninstallComponent(prevGame, componentId);
        return next;
      } catch (err) {
        console.error(err);
        return prevGame;
      }
    });
  }, []);

  const handleLoadFuel = useCallback((fuelKg) => {
    setGame((prevGame) => {
      try {
        return loadFuel(prevGame, Math.max(0, Number(fuelKg) || 0));
      } catch (err) {
        console.error(err);
        return prevGame;
      }
    });
  }, []);

  const handleLaunch = useCallback(() => {
    const launchResult = launchMission(game, activeMissionId);
    if (launchResult.success) {
      setGame(launchResult.game);
      setNotification("LAUNCH AUTHORIZED! MISSION IN FLIGHT.");
      setCurrentScreen("mission-control");
      return true;
    } else {
      setNotification(
        `LAUNCH BLOCKED: ${launchResult.validation.errors.join(", ")}`
      );
      return false;
    }
  }, [game, activeMissionId]);

  const handleCompleteObjective = useCallback((objectiveId) => {
    setGame((prevGame) => {
      try {
        const next = completeGameObjective(prevGame, objectiveId);
        setNotification(`OBJECTIVE VERIFIED: ${objectiveId}`);
        return next;
      } catch (err) {
        console.error(err);
        return prevGame;
      }
    });
  }, []);

  const handleNextPhase = useCallback(() => {
    setGame((prevGame) => {
      try {
        const next = moveToNextPhase(prevGame);
        if (next.missionState?.status === "completed") {
          setNotification("ALL MISSION PHASES COMPLETED! MISSION SUCCESSFUL.");
          setCurrentScreen("results");
        } else if (next.missionState?.status === "failed") {
          const reason =
            next.lastSimulationResult?.reason || "Resource exhaustion";
          setNotification(`SIMULATION FAILED: ${reason.toUpperCase()}`);
        } else {
          const currentPhaseName =
            activeMission.phases[next.missionState?.currentPhaseIndex || 0];
          setNotification(
            `ADVANCED TO PHASE: ${
              currentPhaseName ? currentPhaseName.toUpperCase() : "NEXT"
            }`
          );
        }
        return next;
      } catch (err) {
        console.error(err);
        setNotification(`PHASE ERROR: ${err.message}`);
        return prevGame;
      }
    });
  }, [activeMission]);

  const handleArchiveMission = useCallback(() => {
    if (!game.launched && !game.missionState) {
      setNotification("NO MISSION FLIGHT TO ARCHIVE YET.");
      return;
    }

    const res = getFinalMissionResult(game);
    const currentScore = getGameScore(game);
    const status = game.missionState?.status || "in_progress";
    const totalScoreVal =
      res?.totalScore ?? (currentScore?.totalScore ?? 0);

    let ratingVal = "Needs Improvement";
    if (res?.rating) {
      ratingVal = res.rating;
    } else {
      try {
        ratingVal = getPerformanceRating(totalScoreVal);
      } catch {
        ratingVal = "Needs Improvement";
      }
    }

    const completedCount =
      game.missionState?.completedObjectiveIds?.length || 0;
    const totalObjs = activeMission.objectives?.length || 0;
    const elapsedHours = game.simulationState?.elapsedHours ?? 0;
    const fuelRemaining =
      game.simulationState?.fuelRemainingKg ?? resources.fuelKg;

    const newEntry = {
      id: `flight-${Date.now()}`,
      missionId: activeMissionId,
      name: activeMission.name,
      callsign: `MC-${activeMission.id.slice(0, 3).toUpperCase()}-${Date.now()
        .toString()
        .slice(-4)}`,
      destination: activeMission.name,
      date: new Date().toISOString().split("T")[0],
      duration:
        elapsedHours > 0 ? `${elapsedHours}h Simulated` : "Sub-orbital",
      score: totalScoreVal,
      rating: ratingVal,
      status: status, // "completed", "failed", or "in_progress"
      launchMassKg: resources.totalMassKg,
      fuelRemainingKg: fuelRemaining,
      completedObjectives: completedCount,
      totalObjectives: totalObjs,
      failureReason: game.lastSimulationResult?.reason || null,
    };

    setHistoryList((prev) => {
      const updated = [newEntry, ...prev];
      persistHistory(updated);
      return updated;
    });

    const statusMsg =
      status === "completed"
        ? "COMPLETED MISSION LOG ARCHIVED"
        : status === "failed"
        ? "FAILED MISSION LOG ARCHIVED"
        : "IN-PROGRESS FLIGHT RECORD ARCHIVED";

    setNotification(statusMsg);
    setCurrentScreen("history");
  }, [game, activeMissionId, activeMission, resources]);

  const handleClearHistory = useCallback(() => {
    setHistoryList([]);
    persistHistory([]);
    setNotification("FLIGHT ARCHIVE CLEARED.");
  }, []);

  const handleResetMission = useCallback(() => {
    let fresh = createGame(6000000);
    fresh = installComponent(fresh, "rocket");
    fresh = installComponent(fresh, "spacecraft-bus");
    fresh = installComponent(fresh, "fuel-tank");
    fresh = installComponent(fresh, "solar-panel");
    fresh = loadFuel(fresh, 320);
    setGame(fresh);
    setNotification("MISSION RESET TO PRE-LAUNCH CONFIGURATION");
    setCurrentScreen("designer");
  }, []);

  return {
    currentScreen,
    setCurrentScreen,
    activeMissionId,
    activeMission,
    allMissions: MISSIONS,
    componentCatalog: COMPONENT_CATALOG,
    game,
    resources,
    readiness,
    progress,
    score,
    finalResult,
    historyList,
    notification,
    setNotification,
    selectMission: handleSelectMission,
    installComponent: handleInstallComponent,
    uninstallComponent: handleUninstallComponent,
    loadFuel: handleLoadFuel,
    launch: handleLaunch,
    completeObjective: handleCompleteObjective,
    nextPhase: handleNextPhase,
    archiveMission: handleArchiveMission,
    clearHistory: handleClearHistory,
    resetMission: handleResetMission,
  };
}

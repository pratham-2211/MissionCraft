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

const DEFAULT_HISTORY = [
  {
    id: "hist-01",
    missionId: "earth-observation",
    name: "Earth Observation // Sentinel-1",
    destination: "Low Earth Orbit (700 km)",
    date: "2026-11-10",
    duration: "180 Days",
    score: 500,
    rating: "Excellent",
    status: "completed",
    launchMassKg: 910,
    scienceYield: "1.4 TB telemetry",
  },
  {
    id: "hist-02",
    missionId: "lunar-survey",
    name: "Lunar Survey // Artemis Pathfinder",
    destination: "Lunar Polar Orbit (100 km)",
    date: "2026-11-04",
    duration: "8 Days",
    score: 400,
    rating: "Good",
    status: "completed",
    launchMassKg: 1420,
    scienceYield: "Water-ice deposits mapped",
  },
  {
    id: "hist-03",
    missionId: "mars-exploration",
    name: "Mars Exploration // Red Pioneer",
    destination: "Mars Jezero Crater Relay",
    date: "2026-10-22",
    duration: "540 Days",
    score: 500,
    rating: "Excellent",
    status: "completed",
    launchMassKg: 1980,
    scienceYield: "Deep atmospheric spectrometry",
  },
];

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

  // Saved flight history
  const [historyList, setHistoryList] = useState(DEFAULT_HISTORY);

  // Notifications
  const [notification, setNotification] = useState("");

  // Get active mission definition
  const activeMission = useMemo(() => {
    return getMissionById(activeMissionId) || MISSIONS[0];
  }, [activeMissionId]);

  // Derived real game resources from Member 2's gameEngine
  const resources = useMemo(() => {
    return getGameResources(game);
  }, [game]);

  // Derived launch readiness verification from Member 2's gameEngine
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
    setNotification(`MISSION SELECTED: ${mission ? mission.name.toUpperCase() : missionId}`);
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
      setNotification(`LAUNCH BLOCKED: ${launchResult.validation.errors.join(", ")}`);
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
          setNotification("ALL MISSION PHASES COMPLETED!");
          setCurrentScreen("results");
        } else {
          const currentPhaseName = activeMission.phases[next.missionState?.currentPhaseIndex || 0];
          setNotification(`ADVANCED TO PHASE: ${currentPhaseName ? currentPhaseName.toUpperCase() : "NEXT"}`);
        }
        return next;
      } catch (err) {
        console.error(err);
        return prevGame;
      }
    });
  }, [activeMission]);

  const handleArchiveMission = useCallback(() => {
    const res = getFinalMissionResult(game);
    const newEntry = {
      id: `hist-${Date.now()}`,
      missionId: activeMissionId,
      name: `${activeMission.name} // MC-${Math.floor(100 + Math.random() * 900)}`,
      destination: activeMission.name,
      date: new Date().toISOString().split("T")[0],
      duration: "Completed Flight",
      score: res ? res.totalScore : 500,
      rating: res ? res.rating : "Excellent",
      status: "completed",
      launchMassKg: resources.totalMassKg + resources.fuelKg,
      scienceYield: "All primary objectives achieved",
    };
    setHistoryList((prev) => [newEntry, ...prev]);
    setNotification("MISSION RESULT ARCHIVED TO HISTORY");
    setCurrentScreen("history");
  }, [game, activeMissionId, activeMission, resources]);

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
    resetMission: handleResetMission,
  };
}

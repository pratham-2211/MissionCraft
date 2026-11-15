import { CheckCircle2, X } from "lucide-react";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import CommandCenterScreen from "./screens/CommandCenterScreen.jsx";
import MissionSelectionScreen from "./screens/MissionSelectionScreen.jsx";
import SpacecraftDesignerScreen from "./screens/SpacecraftDesignerScreen.jsx";
import ResourceManagementScreen from "./screens/ResourceManagementScreen.jsx";
import LaunchReadinessScreen from "./screens/LaunchReadinessScreen.jsx";
import MissionControlScreen from "./screens/MissionControlScreen.jsx";
import SimulationHUDScreen from "./screens/SimulationHUDScreen.jsx";
import MissionResultsScreen from "./screens/MissionResultsScreen.jsx";
import MissionHistoryScreen from "./screens/MissionHistoryScreen.jsx";
import { useMissionCraftGame } from "./useMissionCraftGame.js";
import "./MissionCraftStitch.css";

export default function MissionCraftApp() {
  const {
    currentScreen,
    setCurrentScreen,
    activeMissionId,
    activeMission,
    allMissions,
    componentCatalog,
    game,
    resources,
    readiness,
    progress,
    score,
    finalResult,
    historyList,
    notification,
    setNotification,
    selectMission,
    installComponent,
    uninstallComponent,
    loadFuel,
    launch,
    completeObjective,
    nextPhase,
    archiveMission,
    resetMission,
  } = useMissionCraftGame();

  const renderActiveScreen = () => {
    switch (currentScreen) {
      case "command-center":
        return (
          <CommandCenterScreen
            onNavigate={setCurrentScreen}
            onSelectMission={selectMission}
            activeMissionId={activeMissionId}
            allMissions={allMissions}
          />
        );
      case "missions":
        return (
          <MissionSelectionScreen
            onNavigate={setCurrentScreen}
            onSelectMission={selectMission}
            activeMissionId={activeMissionId}
            allMissions={allMissions}
          />
        );
      case "designer":
        return (
          <SpacecraftDesignerScreen
            onNavigate={setCurrentScreen}
            game={game}
            resources={resources}
            activeMission={activeMission}
            componentCatalog={componentCatalog}
            onInstallComponent={installComponent}
            onUninstallComponent={uninstallComponent}
            onLoadFuel={loadFuel}
            onResetMission={resetMission}
          />
        );
      case "resources":
        return (
          <ResourceManagementScreen
            onNavigate={setCurrentScreen}
            game={game}
            resources={resources}
            activeMission={activeMission}
          />
        );
      case "readiness":
        return (
          <LaunchReadinessScreen
            onNavigate={setCurrentScreen}
            game={game}
            resources={resources}
            activeMission={activeMission}
            readiness={readiness}
            onLaunch={launch}
          />
        );
      case "mission-control":
        return (
          <MissionControlScreen
            onNavigate={setCurrentScreen}
            game={game}
            resources={resources}
            activeMission={activeMission}
            progress={progress}
            onNextPhase={nextPhase}
            onCompleteObjective={completeObjective}
          />
        );
      case "simulation-hud":
        return (
          <SimulationHUDScreen
            onNavigate={setCurrentScreen}
            game={game}
            resources={resources}
            activeMission={activeMission}
            progress={progress}
            onNextPhase={nextPhase}
            onCompleteObjective={completeObjective}
          />
        );
      case "results":
        return (
          <MissionResultsScreen
            onNavigate={setCurrentScreen}
            game={game}
            resources={resources}
            activeMission={activeMission}
            finalResult={finalResult}
            score={score}
            onArchiveMission={archiveMission}
            onSelectMission={selectMission}
          />
        );
      case "history":
        return (
          <MissionHistoryScreen
            onNavigate={setCurrentScreen}
            historyList={historyList}
            onSelectMission={selectMission}
          />
        );
      default:
        return (
          <CommandCenterScreen
            onNavigate={setCurrentScreen}
            onSelectMission={selectMission}
            activeMissionId={activeMissionId}
            allMissions={allMissions}
          />
        );
    }
  };

  return (
    <div className="stitch-root">
      {/* Persistent Horizontal Command Bar */}
      <Header
        currentScreen={currentScreen}
        onNavigate={setCurrentScreen}
        activeMission={activeMission}
        isEngineReady={true}
      />

      {/* Floating Notification Toast */}
      {notification ? (
        <div className="stitch-notification-toast font-tnum" role="alert">
          <CheckCircle2 size={16} className="text-secondary" />
          <span>{notification}</span>
          <button
            type="button"
            className="toast-close-btn"
            onClick={() => setNotification("")}
            aria-label="Dismiss notification"
          >
            <X size={14} />
          </button>
        </div>
      ) : null}

      {/* Main Screen Content */}
      <main className="stitch-main-content">
        {renderActiveScreen()}
      </main>

      {/* Persistent Aerospace Footer */}
      <Footer onNavigate={setCurrentScreen} />
    </div>
  );
}

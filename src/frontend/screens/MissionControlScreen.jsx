import { useState, useEffect } from "react";
import {
  Radio,
  ArrowRight,
  AlertTriangle,
  Play,
  Pause,
  FastForward,
  Maximize2,
  CheckCircle2,
  Battery,
  Zap,
  Flame,
  Scale,
} from "lucide-react";
import SpaceScene from "../../three/SpaceScene.jsx";

export default function MissionControlScreen({
  onNavigate,
  game,
  resources,
  activeMission,
  progress,
  onNextPhase,
  onCompleteObjective,
}) {
  const [sessionElapsedSec, setSessionElapsedSec] = useState(0);
  const [isSimulationActive, setIsSimulationActive] = useState(true);

  // Session elapsed timer
  useEffect(() => {
    if (!isSimulationActive) return;
    const interval = setInterval(() => {
      setSessionElapsedSec((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isSimulationActive]);

  const formatSessionTime = (secs) => {
    const m = String(Math.floor(secs / 60)).padStart(2, "0");
    const s = String(secs % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  const missionState = game?.missionState;
  const simulationState = game?.simulationState;
  const isMissionFailed = missionState?.status === "failed";
  const isMissionCompleted = missionState?.status === "completed";
  const failureReason = game?.lastSimulationResult?.reason;

  const currentPhaseName =
    progress?.currentPhase ||
    activeMission.phases?.[missionState?.currentPhaseIndex || 0] ||
    "Pre-launch";
  const currentPhaseIdx = activeMission.phases?.indexOf(currentPhaseName) ?? 0;

  // Real engine telemetry metrics
  const fuelRemainingKg =
    simulationState?.fuelRemainingKg ?? resources.fuelKg;
  const batteryWh = simulationState?.batteryEnergyWh ?? 0;
  const elapsedSimHours = simulationState?.elapsedHours ?? 0;

  return (
    <div className="stitch-screen mission-control-screen">
      {/* Header telemetry ribbon */}
      <section className="screen-header-block mb-3">
        <div className="screen-kicker-row">
          <span className="screen-kicker">
            <Radio size={14} className="text-secondary" />
            FLIGHT OPERATIONS CONSOLE // {activeMission.name.toUpperCase()}
          </span>
          <div className="flex items-center gap-2 font-tnum">
            <span
              className={
                isMissionFailed
                  ? "stitch-dot-failed"
                  : isSimulationActive
                  ? "stitch-pulse-dot"
                  : "stitch-dot-paused"
              }
            />
            <span
              className={`font-semibold ${
                isMissionFailed
                  ? "text-danger"
                  : isSimulationActive
                  ? "text-success"
                  : "text-amber"
              }`}
            >
              {isMissionFailed
                ? `TELEMETRY ALERT: FLIGHT ABORTED`
                : isSimulationActive
                ? "SIMULATION TELEMETRY LINK: ACTIVE"
                : "SIMULATION PAUSED"}
            </span>
            <span className="sep">•</span>
            <span className="text-secondary">
              SIM RUNTIME: T+ {elapsedSimHours}h
            </span>
            <span className="sep">•</span>
            <span className="text-muted">
              SESSION: {formatSessionTime(sessionElapsedSec)}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="screen-title">MISSION CONTROL</h1>
            <p className="screen-subtitle">
              Live spacecraft subsystem telemetry and phase execution powered
              by the MissionCraft physics and resource engine.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="stitch-btn stitch-btn-secondary"
              onClick={() => onNavigate("simulation-hud")}
            >
              <Maximize2 size={15} />
              <span>FULLSCREEN SIM HUD</span>
            </button>
            <button
              type="button"
              className="stitch-btn stitch-btn-danger"
              onClick={() => onNavigate("readiness")}
            >
              <AlertTriangle size={15} />
              <span>ABORT / SAFE MODE</span>
            </button>
          </div>
        </div>
      </section>

      {/* Flight Phase Tracker */}
      <section className="phases-tracker-strip mb-4 font-tnum">
        <div className="tracker-label">
          <span>FLIGHT PHASES</span>
        </div>
        <div className="phases-steps-row">
          {activeMission.phases?.map((phase, idx) => {
            const isDone = idx < currentPhaseIdx;
            const isCurrent = idx === currentPhaseIdx;
            return (
              <div
                key={phase}
                className={`phase-step-chip ${isDone ? "is-done" : ""} ${
                  isCurrent ? "is-current" : ""
                }`}
              >
                <div className="chip-indicator">
                  {isDone ? (
                    <CheckCircle2 size={12} className="text-success" />
                  ) : isCurrent ? (
                    <span
                      className={`current-dot ${
                        isMissionFailed ? "is-failed" : "stitch-pulse-dot"
                      }`}
                    />
                  ) : (
                    <span className="pending-num">{idx + 1}</span>
                  )}
                </div>
                <span className="chip-text">{phase}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Main 2-Column Console Bay */}
      <div className="mission-control-main-grid">
        {/* Left Column: 3D Viewport from Member 3 */}
        <div className="control-viewport-column">
          <div className="viewport-box-header">
            <div className="flex items-center gap-2">
              <span
                className={
                  isSimulationActive ? "stitch-pulse-dot" : "stitch-dot-paused"
                }
              />
              <span className="text-xs uppercase font-bold text-text-primary tracking-wider">
                ORBITAL SIMULATION VIEWPORT
              </span>
            </div>
            <div className="flex items-center gap-2 font-tnum text-xs text-text-muted">
              <span>
                TARGET BODY: <strong>{activeMission.name}</strong>
              </span>
              <span className="sep">•</span>
              <span className="text-secondary">FRAME: THREE.JS 3D</span>
            </div>
          </div>

          {/* Mount Three.js SpaceScene */}
          <div className="control-3d-mount">
            <SpaceScene />
          </div>

          {/* Viewport Action Bar */}
          <div className="viewport-sub-bar">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="stitch-btn-tiny"
                onClick={() => setIsSimulationActive(!isSimulationActive)}
              >
                {isSimulationActive ? <Pause size={12} /> : <Play size={12} />}
                <span>{isSimulationActive ? "PAUSE SIM" : "RESUME"}</span>
              </button>
              <button
                type="button"
                className="stitch-btn-tiny"
                onClick={() => onNavigate("simulation-hud")}
              >
                <Maximize2 size={12} />
                <span>EXPAND HUD</span>
              </button>
            </div>
            <div className="flex items-center gap-3 font-tnum text-xs text-text-muted">
              <span>FOV: 50°</span>
              <span>RENDER: WEBGL</span>
              <span className="text-success">INTERACTIVE</span>
            </div>
          </div>
        </div>

        {/* Right Column: Telemetry Consoles & Phase Ignition Controls */}
        <div className="control-telemetry-column font-tnum">
          {/* Active Phase Card */}
          <div className="active-phase-card">
            <div className="phase-card-top">
              <span className="card-kicker">CURRENT OPERATIONAL STAGE</span>
              {isMissionFailed ? (
                <span className="status-live-chip is-failed text-danger flex items-center gap-1">
                  <AlertTriangle size={12} /> SIMULATION FAILED
                </span>
              ) : isMissionCompleted ? (
                <span className="status-live-chip is-success text-success flex items-center gap-1">
                  <CheckCircle2 size={12} /> MISSION COMPLETED
                </span>
              ) : (
                <span
                  className={`status-live-chip ${
                    !isSimulationActive ? "text-amber" : ""
                  }`}
                >
                  {isSimulationActive ? "ACTIVE EXECUTION" : "PAUSED"}
                </span>
              )}
            </div>
            <h2 className="phase-heading">
              {currentPhaseName}
              {isMissionFailed ? " (ABORTED)" : ""}
            </h2>
            <p className="phase-desc">
              {isMissionFailed
                ? `Simulation halted: ${
                    failureReason || "Resource limits exhausted"
                  }. Spacecraft was unable to continue phase operations.`
                : isMissionCompleted
                ? "All flight phases and operational stages have concluded successfully."
                : `Executing ${currentPhaseName} operations. Propulsion and electrical telemetry are synchronized with the simulation engine.`}
            </p>

            <div className="phase-action-row">
              {isMissionCompleted ? (
                <button
                  type="button"
                  className="stitch-btn stitch-btn-launch-hero w-full"
                  onClick={() => onNavigate("results")}
                >
                  <CheckCircle2 size={18} />
                  <span>VIEW FINAL MISSION RESULTS</span>
                  <ArrowRight size={16} />
                </button>
              ) : isMissionFailed ? (
                <button
                  type="button"
                  className="stitch-btn stitch-btn-danger w-full"
                  onClick={() => onNavigate("results")}
                >
                  <AlertTriangle size={18} />
                  <span>VIEW FAILURE REPORT & DEBRIEF</span>
                  <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  type="button"
                  className="stitch-btn stitch-btn-primary w-full"
                  onClick={onNextPhase}
                  disabled={!isSimulationActive}
                >
                  <FastForward size={16} />
                  <span>
                    EXECUTE NEXT PHASE:{" "}
                    {activeMission.phases?.[currentPhaseIdx + 1] || "FINAL STAGE"}
                  </span>
                  <ArrowRight size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Real Telemetry Numbers Matrix */}
          <div className="telemetry-gauges-grid">
            <div className="telemetry-gauge-card">
              <div className="flex items-center justify-between">
                <span className="gauge-label">PROPELLANT LOAD</span>
                <Flame size={14} className="text-amber" />
              </div>
              <div className="gauge-val text-amber">
                {fuelRemainingKg} <small>kg</small>
              </div>
              <span className="gauge-sub">
                INITIAL: {resources.fuelKg} kg
              </span>
            </div>

            <div className="telemetry-gauge-card">
              <div className="flex items-center justify-between">
                <span className="gauge-label">BATTERY ENERGY</span>
                <Battery size={14} className="text-secondary" />
              </div>
              <div className="gauge-val text-secondary">
                {batteryWh} <small>Wh</small>
              </div>
              <span className="gauge-sub">
                NET: {resources.powerBalanceW >= 0 ? "+" : ""}
                {resources.powerBalanceW} W
              </span>
            </div>

            <div className="telemetry-gauge-card">
              <div className="flex items-center justify-between">
                <span className="gauge-label">SOLAR GENERATION</span>
                <Zap size={14} className="text-success" />
              </div>
              <div className="gauge-val text-success">
                +{resources.powerGenerationW} <small>W</small>
              </div>
              <span className="gauge-sub">
                LOAD: -{resources.powerConsumptionW} W
              </span>
            </div>

            <div className="telemetry-gauge-card">
              <div className="flex items-center justify-between">
                <span className="gauge-label">SPACECRAFT MASS</span>
                <Scale size={14} className="text-primary" />
              </div>
              <div className="gauge-val text-primary">
                {resources.totalMassKg} <small>kg</small>
              </div>
              <span className="gauge-sub">
                DRY MASS: {resources.dryMassKg} kg
              </span>
            </div>
          </div>

          {/* Illustrative Demonstration Label */}
          <div className="illustrative-orbital-note text-[11px] text-text-muted px-1">
            <span>
              * Note: Orbital parameters and 3D scenes are illustrative
              demonstration visualizations; resource and propulsion values are
              calculated live by the simulation engine.
            </span>
          </div>

          {/* Primary Mission Objectives Progress */}
          <div className="control-objectives-card">
            <div className="card-top-header">
              <span className="card-kicker">MISSION OBJECTIVES</span>
              <span className="text-xs text-text-muted">
                {progress?.completedObjectives || 0} /{" "}
                {activeMission.objectives?.length || 3} COMPLETE
              </span>
            </div>

            <div className="objectives-interactive-list">
              {activeMission.objectives?.map((obj) => {
                const isCompleted =
                  missionState?.completedObjectiveIds?.includes(obj.id);
                return (
                  <div
                    key={obj.id}
                    className={`objective-interactive-row ${
                      isCompleted ? "is-completed" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className={`objective-checkbox ${
                          isCompleted ? "checked" : ""
                        }`}
                        onClick={() => onCompleteObjective(obj.id)}
                        disabled={isCompleted || isMissionFailed}
                      >
                        {isCompleted ? (
                          <CheckCircle2 size={16} />
                        ) : (
                          <span className="empty-box" />
                        )}
                      </button>
                      <div>
                        <strong className="obj-name">{obj.name}</strong>
                        <p className="obj-sub">{obj.description}</p>
                      </div>
                    </div>

                    {!isCompleted ? (
                      <button
                        type="button"
                        className="stitch-btn-tiny"
                        onClick={() => onCompleteObjective(obj.id)}
                        disabled={isMissionFailed}
                      >
                        VERIFY
                      </button>
                    ) : (
                      <span className="text-success text-xs font-semibold">
                        VERIFIED
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

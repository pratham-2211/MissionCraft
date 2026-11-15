import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  FastForward,
  CheckCircle2,
  AlertTriangle,
  Pause,
  Play,
  Rocket,
  Flame,
  Battery,
  Zap,
  Scale,
  Clock,
} from "lucide-react";
import SpaceScene from "../../three/SpaceScene.jsx";

export default function SimulationHUDScreen({
  onNavigate,
  game,
  resources,
  activeMission,
  progress,
  onNextPhase,
  onCompleteObjective,
}) {
  const [warpRate, setWarpRate] = useState("1x");
  const [isPaused, setIsPaused] = useState(false);

  const missionState = game?.missionState;
  const simulationState = game?.simulationState;
  const isLaunched = Boolean(game?.launched && missionState);

  const isFailed = missionState?.status === "failed";
  const isCompleted = missionState?.status === "completed";
  const isInProgress = isLaunched && !isFailed && !isCompleted;

  const failureReason = game?.lastSimulationResult?.reason;

  const currentPhaseName =
    progress?.currentPhase ||
    activeMission.phases?.[missionState?.currentPhaseIndex || 0] ||
    "Pre-launch";

  // Real engine telemetry values
  const fuelRemainingKg =
    simulationState?.fuelRemainingKg ?? resources.fuelKg;
  const batteryWh = simulationState?.batteryEnergyWh ?? 0;
  const elapsedSimHours = simulationState?.elapsedHours ?? 0;

  return (
    <div className="stitch-screen simulation-hud-screen">
      {/* HUD Header Bar */}
      <div className="hud-top-ribbon font-tnum">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="stitch-btn-tiny"
            onClick={() => onNavigate("mission-control")}
          >
            <ArrowLeft size={13} />
            <span>MISSION CONTROL</span>
          </button>
          <span className="hud-callsign">
            TARGET: <strong>{activeMission.name.toUpperCase()}</strong>
          </span>
          <span className="sep">•</span>
          <span className="text-secondary">
            STAGE: {currentPhaseName.toUpperCase()}
          </span>
          <span className="sep">•</span>
          <span className="text-muted">
            SIM TIME: T+ {elapsedSimHours}h
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Pause / Resume Controls */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              className={`warp-pill ${isPaused ? "is-active text-amber" : ""}`}
              onClick={() => setIsPaused(!isPaused)}
            >
              {isPaused ? <Play size={11} /> : <Pause size={11} />}
              <span>{isPaused ? "RESUME" : "PAUSE"}</span>
            </button>
          </div>

          <div className="hud-warp-selector">
            <span className="warp-label">WARP:</span>
            {["1x", "10x", "100x"].map((rate) => (
              <button
                key={rate}
                type="button"
                className={`warp-pill ${warpRate === rate ? "is-active" : ""}`}
                onClick={() => setWarpRate(rate)}
                disabled={isPaused || isFailed}
              >
                {rate}
              </button>
            ))}
          </div>

          {/* Accurate State Indicators */}
          <div className="flex items-center gap-2">
            {isFailed ? (
              <span className="hud-state-pill text-danger font-semibold flex items-center gap-1 bg-danger/15 px-2 py-0.5 rounded border border-danger/30">
                <AlertTriangle size={12} />
                SIMULATION FAILED
              </span>
            ) : isCompleted ? (
              <span className="hud-state-pill text-success font-semibold flex items-center gap-1 bg-success/15 px-2 py-0.5 rounded border border-success/30">
                <CheckCircle2 size={12} />
                MISSION COMPLETED
              </span>
            ) : isPaused ? (
              <span className="hud-state-pill text-amber font-semibold flex items-center gap-1 bg-amber/15 px-2 py-0.5 rounded border border-amber/30">
                <Pause size={12} />
                SIMULATION PAUSED
              </span>
            ) : isInProgress ? (
              <span className="hud-state-pill text-success font-semibold flex items-center gap-1">
                <span className="stitch-pulse-dot" />
                SIMULATION ACTIVE
              </span>
            ) : (
              <span className="hud-state-pill text-muted font-semibold">
                PRE-LAUNCH STANDBY
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Full-Viewport 3D Avionics Frame */}
      <div className="hud-viewport-stage">
        {/* Mounted Three.js SpaceScene */}
        <div className="hud-3d-canvas-wrap">
          <SpaceScene />
        </div>

        {/* HUD Failure Alert Banner */}
        {isFailed && (
          <div className="hud-failure-banner font-tnum">
            <AlertTriangle size={16} />
            <span>
              SIMULATION HALTED:{" "}
              {failureReason || "Resource limits exhausted during flight"}
            </span>
          </div>
        )}

        {/* HUD Instruments Overlay */}
        <div className="hud-instruments-overlay pointer-events-none">
          {/* Center Reticle / Crosshair */}
          <div className="hud-crosshair-center">
            <div className="crosshair-ring" />
            <div className="crosshair-dot" />
            <div className="crosshair-line-h" />
            <div className="crosshair-line-v" />
            <div className="hud-vector-tag font-tnum">
              {isFailed
                ? "TRAJECTORY ABORTED"
                : isPaused
                ? "SIMULATION PAUSED"
                : isCompleted
                ? "MISSION COMPLETE"
                : "THREE.JS SIMULATION FRAME"}
            </div>
          </div>

          {/* Left Bay: Objectives & Staging */}
          <div className="hud-left-card pointer-events-auto font-tnum">
            <div className="hud-card-header">
              <span className="hud-kicker">MISSION OBJECTIVES</span>
              <span className="hud-tag">
                {progress?.completedObjectives || 0} /{" "}
                {activeMission.objectives?.length || 3}
              </span>
            </div>

            <div className="hud-objectives-checklist">
              {activeMission.objectives?.map((obj) => {
                const isObjDone =
                  missionState?.completedObjectiveIds?.includes(obj.id);
                return (
                  <div
                    key={obj.id}
                    className={`hud-obj-row ${isObjDone ? "is-verified" : ""}`}
                  >
                    <button
                      type="button"
                      className="hud-check-btn"
                      onClick={() => onCompleteObjective(obj.id)}
                      disabled={isObjDone || isFailed}
                    >
                      {isObjDone ? (
                        <CheckCircle2 size={14} className="text-success" />
                      ) : (
                        <span className="box" />
                      )}
                    </button>
                    <div className="hud-obj-text">
                      <strong className="block text-xs text-text-primary">
                        {obj.name}
                      </strong>
                      <span className="block text-[11px] text-text-muted">
                        {obj.description}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="hud-left-actions mt-3">
              {isCompleted ? (
                <button
                  type="button"
                  className="stitch-btn stitch-btn-success w-full text-xs opacity-90"
                  disabled
                >
                  <CheckCircle2 size={14} />
                  <span>ALL STAGES COMPLETED</span>
                </button>
              ) : isFailed ? (
                <button
                  type="button"
                  className="stitch-btn stitch-btn-danger w-full text-xs opacity-75"
                  disabled
                >
                  <AlertTriangle size={14} />
                  <span>FLIGHT HALTED (FAILED)</span>
                </button>
              ) : isPaused ? (
                <button
                  type="button"
                  className="stitch-btn stitch-btn-secondary w-full text-xs"
                  onClick={() => setIsPaused(false)}
                >
                  <Play size={14} />
                  <span>RESUME TO ADVANCE</span>
                </button>
              ) : (
                <button
                  type="button"
                  className="stitch-btn stitch-btn-secondary w-full text-xs"
                  onClick={onNextPhase}
                >
                  <FastForward size={14} />
                  <span>ADVANCE TO NEXT STAGE</span>
                </button>
              )}
            </div>
          </div>

          {/* Right Bay: Genuine Engine Telemetry Measurements */}
          <div className="hud-right-card pointer-events-auto font-tnum">
            <div className="hud-card-header">
              <span className="hud-kicker">ENGINE FLIGHT TELEMETRY</span>
              <span
                className={`hud-tag ${
                  isFailed
                    ? "text-danger"
                    : isCompleted
                    ? "text-success"
                    : isPaused
                    ? "text-amber"
                    : "text-secondary"
                }`}
              >
                {isFailed
                  ? "ABORTED"
                  : isCompleted
                  ? "COMPLETE"
                  : isPaused
                  ? "PAUSED"
                  : "ACTIVE"}
              </span>
            </div>

            <div className="ephemeris-rows-grid">
              <div className="ephem-item">
                <span className="lbl flex items-center gap-1">
                  <Flame size={12} className="text-amber" /> PROPELLANT
                </span>
                <strong className="val text-amber">
                  {fuelRemainingKg} kg
                </strong>
              </div>
              <div className="ephem-item">
                <span className="lbl flex items-center gap-1">
                  <Battery size={12} className="text-secondary" /> BATTERY
                </span>
                <strong className="val text-secondary">
                  {batteryWh} Wh
                </strong>
              </div>
              <div className="ephem-item">
                <span className="lbl flex items-center gap-1">
                  <Zap size={12} className="text-success" /> POWER GEN
                </span>
                <strong className="val text-success">
                  +{resources.powerGenerationW} W
                </strong>
              </div>
              <div className="ephem-item">
                <span className="lbl">POWER LOAD</span>
                <strong className="val text-text-muted">
                  -{resources.powerConsumptionW} W
                </strong>
              </div>
              <div className="ephem-item">
                <span className="lbl flex items-center gap-1">
                  <Scale size={12} /> TOTAL MASS
                </span>
                <strong className="val">
                  {resources.totalMassKg} kg
                </strong>
              </div>
              <div className="ephem-item">
                <span className="lbl flex items-center gap-1">
                  <Clock size={12} /> SIM RUNTIME
                </span>
                <strong className="val">
                  {elapsedSimHours} hrs
                </strong>
              </div>
            </div>

            <div className="text-[10px] text-text-muted mt-2 px-1 italic">
              * Measurements calculated live by simulation engine. 3D orbit is
              illustrative visualization.
            </div>

            <div className="ephem-actions mt-3">
              {isCompleted ? (
                <button
                  type="button"
                  className="stitch-btn stitch-btn-launch-hero w-full"
                  onClick={() => onNavigate("results")}
                >
                  <CheckCircle2 size={16} />
                  <span>VIEW FINAL MISSION RESULTS</span>
                </button>
              ) : isFailed ? (
                <button
                  type="button"
                  className="stitch-btn stitch-btn-danger w-full text-xs"
                  onClick={() => onNavigate("results")}
                >
                  <AlertTriangle size={14} />
                  <span>VIEW FAILURE REPORT & DEBRIEF</span>
                </button>
              ) : isInProgress ? (
                <button
                  type="button"
                  className="stitch-btn stitch-btn-secondary w-full text-xs"
                  onClick={() => onNavigate("results")}
                >
                  <span>VIEW IN-PROGRESS FLIGHT REPORT</span>
                  <ArrowRight size={14} />
                </button>
              ) : (
                <button
                  type="button"
                  className="stitch-btn stitch-btn-primary w-full text-xs"
                  onClick={() => onNavigate("readiness")}
                >
                  <Rocket size={14} />
                  <span>LAUNCH MISSION</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

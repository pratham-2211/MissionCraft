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
  const [missionElapsedSec, setMissionElapsedSec] = useState(148);
  const [isSimulationActive, setIsSimulationActive] = useState(true);
  const [altitudeKm, setAltitudeKm] = useState(412);
  const [velocityKms, setVelocityKms] = useState(7.82);

  // Dynamic telemetry update loop
  useEffect(() => {
    if (!isSimulationActive) return;
    const interval = setInterval(() => {
      setMissionElapsedSec((prev) => prev + 1);
      setVelocityKms((v) => Number((v + (Math.random() * 0.04 - 0.02)).toFixed(2)));
      setAltitudeKm((a) => Number((a + (Math.random() * 0.2 - 0.1)).toFixed(1)));
    }, 1000);
    return () => clearInterval(interval);
  }, [isSimulationActive]);

  const formatMET = (secs) => {
    const h = String(Math.floor(secs / 3600)).padStart(2, "0");
    const m = String(Math.floor((secs % 3600) / 60)).padStart(2, "0");
    const s = String(secs % 60).padStart(2, "0");
    return `T+ ${h}:${m}:${s}`;
  };

  const currentPhaseName = progress?.currentPhase || activeMission.phases?.[0] || "Pre-launch";
  const currentPhaseIdx = activeMission.phases?.indexOf(currentPhaseName) ?? 0;
  const isMissionCompleted = progress?.status === "completed";

  return (
    <div className="stitch-screen mission-control-screen">
      {/* Header telemetry ribbon */}
      <section className="screen-header-block mb-3">
        <div className="screen-kicker-row">
          <span className="screen-kicker">
            <Radio size={14} className="text-secondary" />
            LIVE FLIGHT OPERATIONS CONSOLE // {activeMission.name.toUpperCase()}
          </span>
          <div className="flex items-center gap-2 font-tnum">
            <span className="stitch-pulse-dot" />
            <span className="text-success font-semibold">CARRIER SIGNAL LOCK [GOLDSTONE DSS-14]</span>
            <span className="sep">•</span>
            <span className="text-secondary">MET: {formatMET(missionElapsedSec)}</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="screen-title">MISSION CONTROL</h1>
            <p className="screen-subtitle">
              Live orbital insertion telemetry and trajectory execution powered by the MissionCraft physics engine.
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
                    <span className="current-dot stitch-pulse-dot" />
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
              <span className="stitch-pulse-dot" />
              <span className="text-xs uppercase font-bold text-text-primary tracking-wider">
                MEMBER 3 THREE.JS SIMULATION VIEWPORT
              </span>
            </div>
            <div className="flex items-center gap-2 font-tnum text-xs text-text-muted">
              <span>TARGET BODY: <strong>{activeMission.name}</strong></span>
              <span className="sep">•</span>
              <span className="text-secondary">FRAME: RK4 INTERACTION</span>
            </div>
          </div>

          {/* Mount Member 3's real SpaceScene */}
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
              <span>RENDER: WEBGL 2.0</span>
              <span className="text-success">60 FPS NOMINAL</span>
            </div>
          </div>
        </div>

        {/* Right Column: Telemetry Consoles & Phase Ignition Controls */}
        <div className="control-telemetry-column font-tnum">
          {/* Active Phase Card */}
          <div className="active-phase-card">
            <div className="phase-card-top">
              <span className="card-kicker">CURRENT OPERATIONAL STAGE</span>
              <span className="status-live-chip">ACTIVE EXECUTION</span>
            </div>
            <h2 className="phase-heading">{currentPhaseName}</h2>
            <p className="phase-desc">
              All engine subsystems report nominal operating pressures. Spacecraft guidance computer is calculating the next velocity vector.
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
              ) : (
                <button
                  type="button"
                  className="stitch-btn stitch-btn-primary w-full"
                  onClick={onNextPhase}
                >
                  <FastForward size={16} />
                  <span>EXECUTE NEXT PHASE: {activeMission.phases?.[currentPhaseIdx + 1] || "FINAL DEBRIEF"}</span>
                  <ArrowRight size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Telemetry Numbers Matrix */}
          <div className="telemetry-gauges-grid">
            <div className="telemetry-gauge-card">
              <span className="gauge-label">ORBITAL ALTITUDE</span>
              <div className="gauge-val text-primary">
                {altitudeKm} <small>km</small>
              </div>
              <span className="gauge-sub">PERIGEE: 405 km</span>
            </div>

            <div className="telemetry-gauge-card">
              <span className="gauge-label">ORBITAL VELOCITY</span>
              <div className="gauge-val text-secondary">
                {velocityKms} <small>km/s</small>
              </div>
              <span className="gauge-sub">MACH 23.4</span>
            </div>

            <div className="telemetry-gauge-card">
              <span className="gauge-label">PROPELLANT LOAD</span>
              <div className="gauge-val text-amber">
                {resources.fuelKg} <small>kg</small>
              </div>
              <span className="gauge-sub">BURN RATE: 0.12 kg/s</span>
            </div>

            <div className="telemetry-gauge-card">
              <span className="gauge-label">ELECTRICAL BUS</span>
              <div className="gauge-val text-success">
                +{resources.powerGenerationW} <small>W</small>
              </div>
              <span className="gauge-sub">NET: +{resources.powerBalanceW} W</span>
            </div>
          </div>

          {/* Primary Mission Objectives Progress */}
          <div className="control-objectives-card">
            <div className="card-top-header">
              <span className="card-kicker">MISSION OBJECTIVES</span>
              <span className="text-xs text-text-muted">
                {progress?.completedObjectives || 0} / {activeMission.objectives?.length || 3} COMPLETE
              </span>
            </div>

            <div className="objectives-interactive-list">
              {activeMission.objectives?.map((obj) => {
                const isCompleted = game.missionState?.completedObjectiveIds?.includes(obj.id);
                return (
                  <div
                    key={obj.id}
                    className={`objective-interactive-row ${isCompleted ? "is-completed" : ""}`}
                  >
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className={`objective-checkbox ${isCompleted ? "checked" : ""}`}
                        onClick={() => onCompleteObjective(obj.id)}
                        disabled={isCompleted}
                      >
                        {isCompleted ? <CheckCircle2 size={16} /> : <span className="empty-box" />}
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
                      >
                        VERIFY
                      </button>
                    ) : (
                      <span className="text-success text-xs font-semibold">VERIFIED</span>
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

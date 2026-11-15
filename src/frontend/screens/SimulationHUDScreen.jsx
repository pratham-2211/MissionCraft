import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  FastForward,
  CheckCircle2,
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

  const currentPhaseName = progress?.currentPhase || activeMission.phases?.[0] || "Pre-launch";
  const isMissionCompleted = progress?.status === "completed";

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
            CRAFT: <strong>MISSIONCRAFT-1 (MC-01)</strong>
          </span>
          <span className="sep">•</span>
          <span className="text-secondary">TARGET: {activeMission.name.toUpperCase()}</span>
          <span className="sep">•</span>
          <span className="text-success font-semibold">STAGE: {currentPhaseName.toUpperCase()}</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="hud-warp-selector">
            <span className="warp-label">WARP:</span>
            {["1x", "10x", "100x"].map((rate) => (
              <button
                key={rate}
                type="button"
                className={`warp-pill ${warpRate === rate ? "is-active" : ""}`}
                onClick={() => setWarpRate(rate)}
              >
                {rate}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="stitch-pulse-dot" />
            <span className="text-success text-xs">J2000 INERTIAL</span>
          </div>
        </div>
      </div>

      {/* Main Full-Viewport 3D Avionics Frame */}
      <div className="hud-viewport-stage">
        {/* Mounted Three.js SpaceScene */}
        <div className="hud-3d-canvas-wrap">
          <SpaceScene />
        </div>

        {/* HUD Overlay Layer */}
        <div className="hud-instruments-overlay pointer-events-none">
          {/* Center Reticle / Crosshair */}
          <div className="hud-crosshair-center">
            <div className="crosshair-ring" />
            <div className="crosshair-dot" />
            <div className="crosshair-line-h" />
            <div className="crosshair-line-v" />
            <div className="hud-vector-tag font-tnum">PROGRADE VECTOR ΔV +0.0 m/s</div>
          </div>

          {/* Left Bay: Objectives & Staging */}
          <div className="hud-left-card pointer-events-auto font-tnum">
            <div className="hud-card-header">
              <span className="hud-kicker">MISSION OBJECTIVES</span>
              <span className="hud-tag">
                {progress?.completedObjectives || 0} / {activeMission.objectives?.length || 3}
              </span>
            </div>

            <div className="hud-objectives-checklist">
              {activeMission.objectives?.map((obj) => {
                const isCompleted = game.missionState?.completedObjectiveIds?.includes(obj.id);
                return (
                  <div
                    key={obj.id}
                    className={`hud-obj-row ${isCompleted ? "is-verified" : ""}`}
                  >
                    <button
                      type="button"
                      className="hud-check-btn"
                      onClick={() => onCompleteObjective(obj.id)}
                      disabled={isCompleted}
                    >
                      {isCompleted ? <CheckCircle2 size={14} className="text-success" /> : <span className="box" />}
                    </button>
                    <div className="hud-obj-text">
                      <strong className="block text-xs text-text-primary">{obj.name}</strong>
                      <span className="block text-[11px] text-text-muted">{obj.description}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="hud-left-actions mt-3">
              <button
                type="button"
                className="stitch-btn stitch-btn-secondary w-full text-xs"
                onClick={onNextPhase}
              >
                <FastForward size={14} />
                <span>ADVANCE TO NEXT STAGE</span>
              </button>
            </div>
          </div>

          {/* Right Bay: Real-time Orbital Vectors */}
          <div className="hud-right-card pointer-events-auto font-tnum">
            <div className="hud-card-header">
              <span className="hud-kicker">ORBITAL EPHEMERIS</span>
              <span className="hud-tag text-secondary">ACTIVE</span>
            </div>

            <div className="ephemeris-rows-grid">
              <div className="ephem-item">
                <span className="lbl">PERIAPSIS</span>
                <strong className="val">110.4 km</strong>
              </div>
              <div className="ephem-item">
                <span className="lbl">APOAPSIS</span>
                <strong className="val">384,400 km</strong>
              </div>
              <div className="ephem-item">
                <span className="lbl">INCLINATION</span>
                <strong className="val">28.5° POLAR</strong>
              </div>
              <div className="ephem-item">
                <span className="lbl">ECCENTRICITY</span>
                <strong className="val">0.0124 (NEAR CIRCULAR)</strong>
              </div>
              <div className="ephem-item">
                <span className="lbl">PERIOD</span>
                <strong className="val">92.8 min</strong>
              </div>
              <div className="ephem-item">
                <span className="lbl">PROPELLANT</span>
                <strong className="val text-amber">{resources.fuelKg} kg</strong>
              </div>
            </div>

            <div className="ephem-actions mt-3">
              {isMissionCompleted ? (
                <button
                  type="button"
                  className="stitch-btn stitch-btn-launch-hero w-full"
                  onClick={() => onNavigate("results")}
                >
                  <CheckCircle2 size={16} />
                  <span>VIEW MISSION RESULTS</span>
                </button>
              ) : (
                <button
                  type="button"
                  className="stitch-btn stitch-btn-primary w-full text-xs"
                  onClick={() => onNavigate("results")}
                >
                  <span>END MISSION & REPORT</span>
                  <ArrowRight size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

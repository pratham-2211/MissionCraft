import {
  Trophy,
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  History,
  Star,
  AlertTriangle,
  RotateCcw,
  ShieldAlert,
  Play,
  Rocket,
} from "lucide-react";
import { getPerformanceRating } from "../../simulation/scoring.js";

export default function MissionResultsScreen({
  onNavigate,
  game,
  resources,
  activeMission,
  finalResult,
  score,
  onArchiveMission,
  onSelectMission,
}) {
  const missionState = game?.missionState;
  const isLaunched = Boolean(game?.launched && missionState);
  const status = missionState?.status || (isLaunched ? "in_progress" : "unlaunched");

  const isCompleted = status === "completed";
  const isFailed = status === "failed";
  const isIncomplete = isLaunched && !isCompleted && !isFailed;

  // Real completed objectives directly from game engine
  const completedObjectiveIds = missionState?.completedObjectiveIds || [];
  const completedCount = completedObjectiveIds.length;
  const totalObjectivesCount = activeMission.objectives?.length || 0;

  // Real score calculations from game engine
  const currentEngineResult = finalResult || score;
  const objectiveScoreVal =
    currentEngineResult?.objectiveScore ?? (completedCount * 100);
  const completionBonusVal = isCompleted
    ? (currentEngineResult?.completionBonus ?? 200)
    : 0;
  const totalScoreVal = isCompleted
    ? (currentEngineResult?.totalScore ?? (objectiveScoreVal + completionBonusVal))
    : objectiveScoreVal;

  // Real performance rating from game engine
  let ratingText = "Unrated";
  if (isCompleted || isFailed || isIncomplete) {
    if (currentEngineResult?.rating) {
      ratingText = currentEngineResult.rating;
    } else {
      try {
        ratingText = getPerformanceRating(totalScoreVal);
      } catch {
        ratingText = "Needs Improvement";
      }
    }
  }

  const fuelRemainingKg =
    game?.simulationState?.fuelRemainingKg ?? resources.fuelKg;
  const elapsedHours = game?.simulationState?.elapsedHours ?? 0;
  const failureReason = game?.lastSimulationResult?.reason;

  const nextMissionId =
    activeMission.id === "earth-observation"
      ? "lunar-survey"
      : activeMission.id === "lunar-survey"
      ? "mars-exploration"
      : "earth-observation";

  // Debrief insights generated strictly from actual simulation outcome
  const debriefCards = isCompleted
    ? [
        {
          title: "Full Flight Profile Certified",
          desc: `Completed all ${activeMission.phases?.length || 0} flight phases from Pre-launch through Mission Complete.`,
          icon: Award,
          status: "PASSED",
        },
        {
          title: "Propellant Reserves Certified",
          desc: `Spacecraft concluded orbital operations with ${fuelRemainingKg} kg propellant remaining in storage.`,
          icon: Trophy,
          status: "NOMINAL",
        },
        {
          title: "Power Subsystem Verified",
          desc: `Maintained a positive power balance of +${resources.powerBalanceW} W with ${resources.powerGenerationW} W generation capacity.`,
          icon: Star,
          status: "VERIFIED",
        },
      ]
    : isFailed
    ? [
        {
          title: "Simulation Abort Incident",
          desc: `Flight terminated prematurely due to: ${failureReason || "Resource exhaustion"}.`,
          icon: AlertTriangle,
          status: "FAILED",
        },
        {
          title: "Halted Operational Stage",
          desc: `Flight ceased during "${activeMission.phases?.[missionState?.currentPhaseIndex] || "Active Stage"}" after ${elapsedHours}h simulated runtime.`,
          icon: ShieldAlert,
          status: "ABORTED",
        },
        {
          title: "Fuel Status at Termination",
          desc: `${fuelRemainingKg} kg propellant remaining when simulation halted.`,
          icon: RotateCcw,
          status: "DEPLETED",
        },
      ]
    : isIncomplete
    ? [
        {
          title: "Flight In Progress",
          desc: `Currently executing "${activeMission.phases?.[missionState?.currentPhaseIndex] || "Active Phase"}" with ${completedCount}/${totalObjectivesCount} objectives complete.`,
          icon: Clock,
          status: "ACTIVE",
        },
        {
          title: "Current Propellant Margin",
          desc: `${fuelRemainingKg} kg propellant remaining for subsequent orbital phases.`,
          icon: Trophy,
          status: "IN TRANSIT",
        },
        {
          title: "Interim Score Certified",
          desc: `Objective points: +${objectiveScoreVal} PTS. Completion bonus (+200 PTS) awarded upon final phase completion.`,
          icon: Star,
          status: "PENDING",
        },
      ]
    : [
        {
          title: "Pre-Launch Status",
          desc: "Spacecraft configuration has not yet been launched on this mission profile.",
          icon: Rocket,
          status: "STANDBY",
        },
        {
          title: "Estimated Propellant",
          desc: `Configured fuel load: ${resources.fuelKg} kg across installed tank capacity.`,
          icon: Trophy,
          status: "READY",
        },
        {
          title: "Readiness Audit",
          desc: "Complete Flight Readiness Review audits in the readiness console before launch.",
          icon: Star,
          status: "PENDING",
        },
      ];

  const heroCardClass = isCompleted
    ? "results-hero-card is-success"
    : isFailed
    ? "results-hero-card is-failed"
    : "results-hero-card is-partial";

  return (
    <div className="stitch-screen mission-results-screen">
      {/* Header */}
      <section className="screen-header-block mb-4">
        <div className="screen-kicker-row">
          <span className="screen-kicker">
            <Trophy size={14} className="text-secondary" />
            FLIGHT DEBRIEF // {activeMission.name.toUpperCase()}
          </span>
          <span
            className={`panel-badge font-tnum ${
              isCompleted
                ? "text-success"
                : isFailed
                ? "text-danger"
                : "text-amber"
            }`}
          >
            {isCompleted
              ? "MISSION COMPLETED"
              : isFailed
              ? "MISSION FAILED"
              : isIncomplete
              ? "MISSION IN PROGRESS"
              : "PRE-LAUNCH STANDBY"}
          </span>
        </div>
        <h1 className="screen-title">
          {isCompleted
            ? "MISSION RESULTS & DEBRIEF"
            : isFailed
            ? "MISSION FAILURE DEBRIEF"
            : isIncomplete
            ? "INCOMPLETE FLIGHT STATUS"
            : "PRE-FLIGHT EVALUATION"}
        </h1>
        <p className="screen-subtitle">
          {isCompleted
            ? "Final flight metrics, objective verifications, and performance ratings certified by the MissionCraft game engine."
            : isFailed
            ? "Simulation telemetry analysis of flight failure and resource exhaustion recorded by the MissionCraft game engine."
            : isIncomplete
            ? "Interim flight progress and partial scoring for active mission operations. Complete all phases to finish the mission."
            : "No flight executed yet. Launch the mission from Launch Readiness to simulate flight operations and record results."}
        </p>
      </section>

      {/* Hero Debrief Score Card */}
      <div className={heroCardClass}>
        <div className="results-trophy-col">
          <div
            className={`trophy-hex-box ${
              isCompleted ? "is-success" : isFailed ? "is-failed" : "is-partial"
            }`}
          >
            {isCompleted ? (
              <Trophy size={48} className="text-success" />
            ) : isFailed ? (
              <AlertTriangle size={48} className="text-danger" />
            ) : isIncomplete ? (
              <Clock size={48} className="text-amber" />
            ) : (
              <Rocket size={48} className="text-secondary" />
            )}
          </div>
          <span
            className={`rating-pill uppercase ${
              isCompleted
                ? "is-success"
                : isFailed
                ? "is-failed"
                : "is-partial"
            }`}
          >
            {ratingText} RATING
          </span>
        </div>

        <div className="results-headline-col">
          <span className="results-kicker">
            {isCompleted
              ? "ALL MISSION OBJECTIVES ACHIEVED"
              : isFailed
              ? "FLIGHT OPERATIONS TERMINATED"
              : isIncomplete
              ? "FLIGHT CURRENTLY IN PROGRESS"
              : "READY FOR LAUNCH AUTHORIZATION"}
          </span>
          <h2 className="results-main-title">
            {isCompleted
              ? "Mission Accomplished — Flight Successful"
              : isFailed
              ? "Mission Failed — Flight Aborted"
              : isIncomplete
              ? `In Flight: Phase ${
                  (missionState?.currentPhaseIndex ?? 0) + 1
                }/${activeMission.phases?.length || 1}`
              : "Pre-Flight Configuration"}
          </h2>
          <p className="results-desc">
            {isCompleted
              ? `Spacecraft completed all ${activeMission.phases?.length || 0} operational phases and achieved verified objective telemetry.`
              : isFailed
              ? `Flight was aborted during the "${
                  activeMission.phases?.[missionState?.currentPhaseIndex] || "execution"
                }" phase due to: ${failureReason || "resource limits exceeded"}.`
              : isIncomplete
              ? `Spacecraft is currently executing phase "${
                  activeMission.phases?.[missionState?.currentPhaseIndex] || "active"
                }". Objective verifications and flight scoring are updated live.`
              : "Launch authorization is pending. Visit Spacecraft Designer and Launch Readiness to start this mission."}
          </p>

          <div className="results-score-breakdown font-tnum">
            <div className="score-cell">
              <span className="score-lbl">OBJECTIVES SCORE</span>
              <strong className="score-val text-primary">
                +{objectiveScoreVal} PTS
              </strong>
            </div>
            <div className="score-cell">
              <span className="score-lbl">COMPLETION BONUS</span>
              <strong
                className={`score-val ${
                  isCompleted ? "text-success" : "text-muted"
                }`}
              >
                +{completionBonusVal} PTS
              </strong>
            </div>
            <div className="score-cell highlight">
              <span className="score-lbl">TOTAL ENGINE SCORE</span>
              <strong
                className={`score-val-total ${
                  isCompleted
                    ? "text-secondary"
                    : isFailed
                    ? "text-danger"
                    : "text-amber"
                }`}
              >
                {totalScoreVal} PTS
              </strong>
            </div>
          </div>
        </div>

        <div className="results-actions-col">
          {isLaunched ? (
            <button
              type="button"
              className="stitch-btn stitch-btn-primary w-full"
              onClick={onArchiveMission}
            >
              <History size={16} />
              <span>SAVE TO MISSION HISTORY</span>
            </button>
          ) : (
            <button
              type="button"
              className="stitch-btn stitch-btn-primary w-full"
              onClick={() => onNavigate("readiness")}
            >
              <Rocket size={16} />
              <span>LAUNCH MISSION</span>
            </button>
          )}

          {isCompleted && (
            <button
              type="button"
              className="stitch-btn stitch-btn-secondary w-full"
              onClick={() => {
                onSelectMission(nextMissionId);
                onNavigate("designer");
              }}
            >
              <span>NEXT: {nextMissionId.toUpperCase()}</span>
              <ArrowRight size={15} />
            </button>
          )}

          {isFailed && (
            <button
              type="button"
              className="stitch-btn stitch-btn-secondary w-full"
              onClick={() => onNavigate("designer")}
            >
              <RotateCcw size={15} />
              <span>RE-DESIGN SPACECRAFT</span>
            </button>
          )}

          {isIncomplete && (
            <button
              type="button"
              className="stitch-btn stitch-btn-secondary w-full"
              onClick={() => onNavigate("mission-control")}
            >
              <Play size={15} />
              <span>RESUME MISSION CONTROL</span>
            </button>
          )}
        </div>
      </div>

      {/* Objectives Verification Log */}
      <section className="results-objectives-section mt-6 font-tnum">
        <div className="section-header-row">
          <div>
            <span className="panel-kicker">TELEMETRY VERIFICATION</span>
            <h2 className="panel-title">Flight Objective Log</h2>
          </div>
          <span
            className={`panel-tag ${
              isCompleted
                ? "text-success"
                : isFailed
                ? "text-danger"
                : "text-amber"
            }`}
          >
            {completedCount} / {totalObjectivesCount} VERIFIED COMPLETE
          </span>
        </div>

        <div className="objectives-verified-grid">
          {activeMission.objectives?.map((obj, idx) => {
            const isObjCompleted = completedObjectiveIds.includes(obj.id);
            return (
              <div
                key={obj.id}
                className={`verified-obj-card ${
                  isObjCompleted
                    ? "is-verified-pass"
                    : isFailed
                    ? "is-failed-unmet"
                    : "is-pending"
                }`}
              >
                <div className="verified-card-top">
                  <span className="verified-num">OBJ-0{idx + 1}</span>
                  {isObjCompleted ? (
                    <span className="badge-pass text-success flex items-center gap-1">
                      <CheckCircle2 size={13} /> VERIFIED PASS
                    </span>
                  ) : isFailed ? (
                    <span className="badge-unmet text-danger flex items-center gap-1">
                      <XCircle size={13} /> UNMET AT ABORT
                    </span>
                  ) : (
                    <span className="badge-pending text-amber flex items-center gap-1">
                      <Clock size={13} /> PENDING
                    </span>
                  )}
                </div>
                <strong className="verified-name">{obj.name}</strong>
                <p className="verified-desc">{obj.description}</p>
                <div className="verified-meta">
                  <span>POINTS: {isObjCompleted ? "+100 PTS" : "0 PTS"}</span>
                  <span
                    className={
                      isObjCompleted
                        ? "text-success"
                        : isFailed
                        ? "text-danger"
                        : "text-amber"
                    }
                  >
                    STATUS:{" "}
                    {isObjCompleted
                      ? "VERIFIED BY ENGINE"
                      : isFailed
                      ? "NOT FULFILLED"
                      : "INCOMPLETE"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Debrief & Accolades */}
      <section className="commendations-section mt-6">
        <div className="section-header-row">
          <div>
            <span className="panel-kicker">ENGINEERING ANALYSIS</span>
            <h2 className="panel-title">Flight Debrief & Performance Details</h2>
          </div>
          <span className="panel-tag font-tnum">
            {isCompleted
              ? "ENGINE CERTIFIED"
              : isFailed
              ? "ABORT RECORD"
              : isIncomplete
              ? "TELEMETRY LOG"
              : "PRE-LAUNCH"}
          </span>
        </div>

        <div className="commendations-grid">
          {debriefCards.map((c) => {
            const Icon = c.icon;
            return (
              <div key={c.title} className="commendation-card">
                <div className="commendation-icon-box">
                  <Icon
                    size={22}
                    className={
                      isCompleted
                        ? "text-secondary"
                        : isFailed
                        ? "text-danger"
                        : "text-amber"
                    }
                  />
                </div>
                <div className="commendation-copy">
                  <div className="flex items-center justify-between">
                    <strong className="commendation-title">{c.title}</strong>
                    <span className="text-[10px] font-bold text-text-muted">
                      {c.status}
                    </span>
                  </div>
                  <p className="commendation-desc">{c.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom Footer Actions */}
      <div className="screen-footer-actions-row mt-6">
        <button
          type="button"
          className="stitch-btn stitch-btn-secondary"
          onClick={() => onNavigate("command-center")}
        >
          <span>RETURN TO COMMAND CENTER</span>
        </button>

        {isLaunched && (
          <button
            type="button"
            className="stitch-btn stitch-btn-primary"
            onClick={onArchiveMission}
          >
            <span>VIEW IN MISSION HISTORY ARCHIVE</span>
            <ArrowRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

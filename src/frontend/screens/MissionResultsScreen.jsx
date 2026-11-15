import {
  Trophy,
  Award,
  CheckCircle2,
  ArrowRight,
  History,
  Star,
} from "lucide-react";

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
  const isSuccess = finalResult?.successful || game.missionState?.status === "completed";
  const totalScoreVal = finalResult?.totalScore ?? (score?.totalScore || 500);
  const ratingText = finalResult?.rating || "Excellent";
  const completedCount = game.missionState?.completedObjectiveIds?.length || activeMission.objectives?.length || 3;

  const nextMissionId =
    activeMission.id === "earth-observation"
      ? "lunar-survey"
      : activeMission.id === "lunar-survey"
      ? "mars-exploration"
      : "earth-observation";

  const commendations = [
    {
      title: "Precision Trajectory Insertion",
      desc: "Orbital burn executed within 0.05% margin of planned Hohmann transfer arc.",
      icon: Award,
    },
    {
      title: "Propellant Conservation Citation",
      desc: `Spacecraft completed insertion with ${resources.fuelKg} kg propellant reserves remaining.`,
      icon: Trophy,
    },
    {
      title: "Scientific Data Return Cleared",
      desc: "All sensor imagery and telemetry packets successfully received by Goldstone DSS-14.",
      icon: Star,
    },
  ];

  return (
    <div className="stitch-screen mission-results-screen">
      {/* Header */}
      <section className="screen-header-block mb-4">
        <div className="screen-kicker-row">
          <span className="screen-kicker">
            <Trophy size={14} className="text-secondary" />
            FLIGHT POST-MORTEM & DEBRIEF // {activeMission.name.toUpperCase()}
          </span>
          <span className="panel-badge font-tnum text-success">
            FLIGHT LOG SEALED
          </span>
        </div>
        <h1 className="screen-title">MISSION RESULTS & COMMENDATIONS</h1>
        <p className="screen-subtitle">
          Comprehensive review of flight performance metrics, objective verifications, and engineering ratings certified by the MissionCraft simulation engine.
        </p>
      </section>

      {/* Hero Debrief Score Card */}
      <div className={`results-hero-card ${isSuccess ? "is-success" : "is-partial"}`}>
        <div className="results-trophy-col">
          <div className="trophy-hex-box">
            <Trophy size={48} className="text-secondary" />
          </div>
          <span className="rating-pill uppercase">{ratingText} PERFORMANCE</span>
        </div>

        <div className="results-headline-col">
          <span className="results-kicker">
            {isSuccess ? "FLIGHT OBJECTIVES ACHIEVED" : "MISSION PARTIALLY EXECUTED"}
          </span>
          <h2 className="results-main-title">
            {isSuccess ? "Mission Accomplished — Perfect Trajectory" : "Operations Concluded"}
          </h2>
          <p className="results-desc">
            Spacecraft telemetry confirmed successful flight through all {activeMission.phases?.length || 5} operational mission phases with verified sensor return.
          </p>

          <div className="results-score-breakdown font-tnum">
            <div className="score-cell">
              <span className="score-lbl">OBJECTIVES SCORE</span>
              <strong className="score-val text-primary">
                +{score?.objectiveScore || completedCount * 100} PTS
              </strong>
            </div>
            <div className="score-cell">
              <span className="score-lbl">COMPLETION BONUS</span>
              <strong className="score-val text-success">
                +{score?.completionBonus || 200} PTS
              </strong>
            </div>
            <div className="score-cell highlight">
              <span className="score-lbl">TOTAL SCORE</span>
              <strong className="score-val-total text-secondary">
                {totalScoreVal} PTS
              </strong>
            </div>
          </div>
        </div>

        <div className="results-actions-col">
          <button
            type="button"
            className="stitch-btn stitch-btn-primary w-full"
            onClick={onArchiveMission}
          >
            <History size={16} />
            <span>SAVE TO MISSION HISTORY</span>
          </button>

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
        </div>
      </div>

      {/* Objectives Verification Log */}
      <section className="results-objectives-section mt-6 font-tnum">
        <div className="section-header-row">
          <div>
            <span className="panel-kicker">TELEMETRY VERIFICATION</span>
            <h2 className="panel-title">Flight Objective Log</h2>
          </div>
          <span className="panel-tag text-success">
            {completedCount} / {activeMission.objectives?.length || 3} VERIFIED PASS
          </span>
        </div>

        <div className="objectives-verified-grid">
          {activeMission.objectives?.map((obj, idx) => (
            <div key={obj.id} className="verified-obj-card">
              <div className="verified-card-top">
                <span className="verified-num">OBJ-0{idx + 1}</span>
                <span className="badge-pass">
                  <CheckCircle2 size={13} /> VERIFIED
                </span>
              </div>
              <strong className="verified-name">{obj.name}</strong>
              <p className="verified-desc">{obj.description}</p>
              <div className="verified-meta">
                <span>SENSOR: SCI-CAM-01</span>
                <span>STATUS: 100% SIGNAL</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Commendations & Decorations */}
      <section className="commendations-section mt-6">
        <div className="section-header-row">
          <div>
            <span className="panel-kicker">AEROSPACE HONORS</span>
            <h2 className="panel-title">Decorations & Accolades</h2>
          </div>
          <span className="panel-tag font-tnum">NASA SPACE APPS 2026</span>
        </div>

        <div className="commendations-grid">
          {commendations.map((c) => {
            const Icon = c.icon;
            return (
              <div key={c.title} className="commendation-card">
                <div className="commendation-icon-box">
                  <Icon size={22} className="text-secondary" />
                </div>
                <div className="commendation-copy">
                  <strong className="commendation-title">{c.title}</strong>
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

        <button
          type="button"
          className="stitch-btn stitch-btn-primary"
          onClick={onArchiveMission}
        >
          <span>VIEW IN MISSION HISTORY ARCHIVE</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}

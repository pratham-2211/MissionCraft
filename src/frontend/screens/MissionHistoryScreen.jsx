import {
  History,
  CheckCircle2,
  ArrowRight,
  Rocket,
  FileText,
  Play,
} from "lucide-react";

export default function MissionHistoryScreen({
  onNavigate,
  historyList,
  onSelectMission,
}) {
  const totalMissions = historyList.length;
  const avgScore =
    totalMissions > 0
      ? Math.round(
          historyList.reduce((acc, cur) => acc + (cur.score || 0), 0) / totalMissions
        )
      : 0;

  return (
    <div className="stitch-screen mission-history-screen">
      {/* Header */}
      <section className="screen-header-block mb-4">
        <div className="screen-kicker-row">
          <span className="screen-kicker">
            <History size={14} className="text-secondary" />
            MISSION ARCHIVE // CAREER FLIGHT LOG
          </span>
          <span className="panel-badge font-tnum">
            {totalMissions} FLIGHTS RECORDED
          </span>
        </div>
        <h1 className="screen-title">HISTORICAL MISSIONS & LOGS</h1>
        <p className="screen-subtitle">
          Archived telemetry logs, trajectory performance records, and debrief ratings from previous exploration campaigns.
        </p>
      </section>

      {/* Career Overview Metrics Grid */}
      <div className="career-summary-grid font-tnum mb-6">
        <div className="career-metric-card">
          <span className="metric-label">TOTAL MISSIONS FLOWN</span>
          <div className="metric-val text-primary">{totalMissions}</div>
          <span className="metric-sub">ALL LAUNCHES VERIFIED</span>
        </div>

        <div className="career-metric-card">
          <span className="metric-label">MISSION SUCCESS RATE</span>
          <div className="metric-val text-success">100%</div>
          <span className="metric-sub">0 CATASTROPHIC ABORTS</span>
        </div>

        <div className="career-metric-card">
          <span className="metric-label">AVERAGE FLIGHT SCORE</span>
          <div className="metric-val text-secondary">{avgScore} PTS</div>
          <span className="metric-sub">RATING: EXCELLENT</span>
        </div>

        <div className="career-metric-card">
          <span className="metric-label">SCIENCE DATA YIELD</span>
          <div className="metric-val text-amber">4.8 TB</div>
          <span className="metric-sub">TELEMETRY CATALOGUED</span>
        </div>
      </div>

      {/* Flight History Records Table */}
      <section className="history-table-section">
        <div className="section-header-row">
          <div>
            <span className="panel-kicker">FLIGHT TELEMETRY ARCHIVE</span>
            <h2 className="panel-title">Mission Debrief Log</h2>
          </div>
          <button
            type="button"
            className="stitch-btn stitch-btn-primary"
            onClick={() => onNavigate("missions")}
          >
            <Rocket size={15} />
            <span>START NEW MISSION</span>
          </button>
        </div>

        <div className="table-wrapper font-tnum">
          <table className="avionics-table">
            <thead>
              <tr>
                <th>MISSION CALLSIGN</th>
                <th>TARGET DESTINATION</th>
                <th>FLIGHT DATE</th>
                <th>DURATION</th>
                <th>LAUNCH MASS</th>
                <th>RATING</th>
                <th>SCORE</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {historyList.map((entry) => (
                <tr key={entry.id}>
                  <td>
                    <strong>{entry.name}</strong>
                  </td>
                  <td className="text-secondary">{entry.destination}</td>
                  <td className="text-muted">{entry.date}</td>
                  <td>{entry.duration || "8 Days"}</td>
                  <td>{entry.launchMassKg ? `${entry.launchMassKg} kg` : "1,420 kg"}</td>
                  <td>
                    <span className="rating-tag text-success">
                      <CheckCircle2 size={12} /> {entry.rating || "Excellent"}
                    </span>
                  </td>
                  <td>
                    <strong className="text-secondary">{entry.score || 500} pts</strong>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="stitch-btn-tiny"
                        onClick={() => {
                          if (entry.missionId) onSelectMission(entry.missionId);
                          onNavigate("results");
                        }}
                      >
                        <FileText size={12} />
                        <span>DEBRIEF</span>
                      </button>
                      <button
                        type="button"
                        className="stitch-btn-tiny"
                        onClick={() => {
                          if (entry.missionId) onSelectMission(entry.missionId);
                          onNavigate("simulation-hud");
                        }}
                      >
                        <Play size={12} />
                        <span>REPLAY 3D</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Screen Footer Actions */}
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
          onClick={() => onNavigate("missions")}
        >
          <span>INITIATE NEXT FLIGHT ASSIGNMENT</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}

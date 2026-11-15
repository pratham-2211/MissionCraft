import {
  History,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  Rocket,
  FileText,
  Trash2,
} from "lucide-react";

export default function MissionHistoryScreen({
  onNavigate,
  historyList = [],
  onSelectMission,
  onClearHistory,
}) {
  const totalMissions = historyList.length;
  const completedMissions = historyList.filter(
    (entry) => entry.status === "completed"
  ).length;
  const failedMissions = historyList.filter(
    (entry) => entry.status === "failed"
  ).length;

  const successRate =
    totalMissions > 0
      ? Math.round((completedMissions / totalMissions) * 100)
      : 0;

  const avgScore =
    totalMissions > 0
      ? Math.round(
          historyList.reduce((acc, cur) => acc + (cur.score || 0), 0) /
            totalMissions
        )
      : 0;

  const totalObjectivesAchieved = historyList.reduce(
    (acc, cur) => acc + (cur.completedObjectives || 0),
    0
  );

  return (
    <div className="stitch-screen mission-history-screen">
      {/* Header */}
      <section className="screen-header-block mb-4">
        <div className="screen-kicker-row">
          <span className="screen-kicker">
            <History size={14} className="text-secondary" />
            MISSION ARCHIVE // GENUINE FLIGHT LOGS
          </span>
          <span className="panel-badge font-tnum">
            {totalMissions}{" "}
            {totalMissions === 1 ? "FLIGHT RECORDED" : "FLIGHTS RECORDED"}
          </span>
        </div>
        <h1 className="screen-title">HISTORICAL MISSIONS & LOGS</h1>
        <p className="screen-subtitle">
          Archived debrief logs, telemetry outcomes, and performance ratings
          recorded from genuine simulation flights.
        </p>
      </section>

      {/* Career Overview Metrics Grid */}
      <div className="career-summary-grid font-tnum mb-6">
        <div className="career-metric-card">
          <span className="metric-label">TOTAL MISSIONS FLOWN</span>
          <div className="metric-val text-primary">{totalMissions}</div>
          <span className="metric-sub">
            {totalMissions > 0
              ? `${completedMissions} PASSED, ${failedMissions} FAILED`
              : "NO FLIGHTS ON RECORD"}
          </span>
        </div>

        <div className="career-metric-card">
          <span className="metric-label">MISSION SUCCESS RATE</span>
          <div
            className={`metric-val ${
              totalMissions === 0
                ? "text-muted"
                : successRate >= 70
                ? "text-success"
                : "text-amber"
            }`}
          >
            {totalMissions > 0 ? `${successRate}%` : "--"}
          </div>
          <span className="metric-sub">
            {totalMissions > 0
              ? `${completedMissions} OF ${totalMissions} COMPLETED`
              : "REQUIRES COMPLETED MISSIONS"}
          </span>
        </div>

        <div className="career-metric-card">
          <span className="metric-label">AVERAGE FLIGHT SCORE</span>
          <div className="metric-val text-secondary">
            {totalMissions > 0 ? `${avgScore} PTS` : "--"}
          </div>
          <span className="metric-sub">
            {totalMissions > 0
              ? "GAME ENGINE EVALUATION"
              : "SCORING AWAITS LAUNCH"}
          </span>
        </div>

        <div className="career-metric-card">
          <span className="metric-label">OBJECTIVES ACHIEVED</span>
          <div className="metric-val text-amber">
            {totalMissions > 0 ? totalObjectivesAchieved : "--"}
          </div>
          <span className="metric-sub">
            {totalMissions > 0
              ? "VERIFIED IN ENGINE"
              : "0 OBJECTIVES LOGGED"}
          </span>
        </div>
      </div>

      {/* Flight History Records Section */}
      <section className="history-table-section">
        <div className="section-header-row">
          <div>
            <span className="panel-kicker">CERTIFIED LOG ARCHIVE</span>
            <h2 className="panel-title">Mission Debrief Log</h2>
          </div>
          <div className="flex items-center gap-2">
            {totalMissions > 0 && onClearHistory && (
              <button
                type="button"
                className="stitch-btn stitch-btn-secondary"
                onClick={onClearHistory}
              >
                <Trash2 size={14} />
                <span>CLEAR ARCHIVE</span>
              </button>
            )}
            <button
              type="button"
              className="stitch-btn stitch-btn-primary"
              onClick={() => onNavigate("missions")}
            >
              <Rocket size={15} />
              <span>START NEW MISSION</span>
            </button>
          </div>
        </div>

        {totalMissions === 0 ? (
          <div className="history-empty-card">
            <div className="empty-icon-box">
              <History size={42} className="text-secondary opacity-75" />
            </div>
            <h3 className="empty-title">NO FLIGHT RECORDS ARCHIVED YET</h3>
            <p className="empty-desc">
              No genuine mission flights have been completed or saved to history
              yet. Choose a mission, install spacecraft components, verify launch
              readiness, and execute orbital phases to generate certified
              simulation results.
            </p>
            <div className="flex items-center gap-3 mt-3">
              <button
                type="button"
                className="stitch-btn stitch-btn-primary"
                onClick={() => onNavigate("missions")}
              >
                <Rocket size={15} />
                <span>SELECT MISSION PROFILE</span>
              </button>
              <button
                type="button"
                className="stitch-btn stitch-btn-secondary"
                onClick={() => onNavigate("designer")}
              >
                <span>OPEN SPACECRAFT DESIGNER</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        ) : (
          <div className="table-wrapper font-tnum">
            <table className="avionics-table">
              <thead>
                <tr>
                  <th>MISSION CALLSIGN</th>
                  <th>DESTINATION</th>
                  <th>FLIGHT DATE</th>
                  <th>SIM RUNTIME</th>
                  <th>LAUNCH MASS</th>
                  <th>OUTCOME & RATING</th>
                  <th>SCORE</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {historyList.map((entry) => {
                  const isEntryCompleted = entry.status === "completed";
                  const isEntryFailed = entry.status === "failed";

                  return (
                    <tr key={entry.id}>
                      <td>
                        <strong>{entry.callsign || entry.name}</strong>
                      </td>
                      <td className="text-secondary">{entry.destination}</td>
                      <td className="text-muted">{entry.date}</td>
                      <td>{entry.duration || "--"}</td>
                      <td>
                        {entry.launchMassKg ? `${entry.launchMassKg} kg` : "--"}
                      </td>
                      <td>
                        {isEntryCompleted ? (
                          <span className="rating-tag text-success flex items-center gap-1">
                            <CheckCircle2 size={12} />
                            COMPLETED ({entry.rating})
                          </span>
                        ) : isEntryFailed ? (
                          <span className="rating-tag text-danger flex items-center gap-1">
                            <AlertTriangle size={12} />
                            FAILED ({entry.rating})
                          </span>
                        ) : (
                          <span className="rating-tag text-amber flex items-center gap-1">
                            <Clock size={12} />
                            IN FLIGHT ({entry.rating})
                          </span>
                        )}
                      </td>
                      <td>
                        <strong
                          className={
                            isEntryCompleted
                              ? "text-secondary"
                              : isEntryFailed
                              ? "text-danger"
                              : "text-amber"
                          }
                        >
                          {entry.score ?? 0} pts
                        </strong>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            className="stitch-btn-tiny"
                            onClick={() => {
                              if (entry.missionId) {
                                onSelectMission(entry.missionId);
                              }
                              onNavigate("results");
                            }}
                          >
                            <FileText size={12} />
                            <span>DEBRIEF</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
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

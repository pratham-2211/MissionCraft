import {
  ShieldCheck,
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowLeft,
  Rocket,
  Layers,
  Fuel,
  Zap,
  DollarSign,
  Cpu,
} from "lucide-react";

export default function LaunchReadinessScreen({
  onNavigate,
  game,
  resources,
  activeMission,
  readiness,
  onLaunch,
}) {
  const selectedIds = game.spacecraft.selectedComponentIds || [];
  const isReady = readiness.ready;
  const launchMass = resources.totalMassKg + resources.fuelKg;

  // Discrete checklist items mapping engine rules
  const checklistItems = [
    {
      id: "rocket",
      name: "Orbital Launch Vehicle",
      rule: "Mandatory primary stage booster",
      passed: selectedIds.includes("rocket"),
      error: "Launch vehicle is missing.",
      icon: Rocket,
    },
    {
      id: "required-hardware",
      name: "Mission Subsystems Hardware",
      rule: `Requires: ${activeMission.requiredComponentIds?.join(", ")}`,
      passed: activeMission.requiredComponentIds?.every((id) =>
        selectedIds.includes(id)
      ),
      error: "Required components missing.",
      icon: Cpu,
    },
    {
      id: "budget",
      name: "Mission Financial Allocation",
      rule: "Expenditure cannot exceed $6.0M",
      passed: resources.remainingBudget >= 0,
      error: "Mission budget exceeded.",
      icon: DollarSign,
    },
    {
      id: "mass",
      name: "Total Launch Vehicle Mass",
      rule: `Must be ≤ ${activeMission.maxLaunchMassKg} kg`,
      passed: launchMass <= (activeMission.maxLaunchMassKg || 1500),
      error: `Mass (${launchMass} kg) exceeds limit (${activeMission.maxLaunchMassKg} kg).`,
      icon: Layers,
    },
    {
      id: "fuel-capacity",
      name: "Fuel Tank Capacity Bounds",
      rule: "Propellant must fit within tank capacity",
      passed: resources.remainingFuelCapacityKg >= 0,
      error: "Loaded fuel exceeds tank capacity.",
      icon: Fuel,
    },
    {
      id: "min-fuel",
      name: "Minimum Propellant for ΔV",
      rule: `Must have ≥ ${activeMission.minFuelKg} kg propellant`,
      passed: resources.fuelKg >= (activeMission.minFuelKg || 300),
      error: `Fuel (${resources.fuelKg} kg) below minimum (${activeMission.minFuelKg} kg).`,
      icon: Fuel,
    },
    {
      id: "power",
      name: "Electrical Power Balance",
      rule: `Net generation must be ≥ ${activeMission.requiredPowerBalanceW} W`,
      passed: resources.powerBalanceW >= (activeMission.requiredPowerBalanceW || 0),
      error: "Insufficient electrical generation for payload draw.",
      icon: Zap,
    },
    {
      id: "battery",
      name: "Battery Energy Storage Margin",
      rule: "Recommended reserve for eclipse phases",
      passed: resources.batteryCapacityWh > 0,
      warning: "No battery installed (advisory only).",
      icon: Zap,
    },
  ];

  return (
    <div className="stitch-screen launch-readiness-screen">
      {/* Header */}
      <section className="screen-header-block mb-4">
        <div className="screen-kicker-row">
          <span className="screen-kicker">
            <ShieldCheck size={14} className="text-secondary" />
            FLIGHT READINESS REVIEW // NASA FRR PROTOCOL
          </span>
          <span className={`panel-badge font-tnum ${isReady ? "text-success" : "text-danger"}`}>
            {isReady ? "AUTHORIZATION GRANTED" : "HOLD DETECTED"}
          </span>
        </div>
        <h1 className="screen-title">LAUNCH VALIDATION MATRIX</h1>
        <p className="screen-subtitle">
          Rigorous pre-flight audit for <strong>{activeMission.name}</strong>. All safety criteria, engineering envelopes, and trajectory fuel margins are evaluated against flight engine rules.
        </p>
      </section>

      {/* Main Readiness Authorization Banner */}
      <div className={`readiness-banner-box ${isReady ? "is-ready-banner" : "is-blocked-banner"}`}>
        <div className="banner-icon-side">
          {isReady ? (
            <CheckCircle2 size={38} className="text-success" />
          ) : (
            <AlertOctagon size={38} className="text-danger" />
          )}
        </div>

        <div className="banner-copy-side">
          <span className="banner-kicker">
            {isReady ? "STATUS: GO FOR LAUNCH" : "STATUS: NO-GO / HOLD COUNTDOWN"}
          </span>
          <h2 className="banner-title">
            {isReady
              ? "All Systems Nominal — Flight Clearance Verified"
              : `${readiness.errors.length} Critical Blocking Error(s) Preventing Launch`}
          </h2>
          <p className="banner-desc">
            {isReady
              ? "Your spacecraft configuration satisfies all aerodynamic, propellant, mass, and power constraints. Flight Director authorization is cleared."
              : "Review the checklist errors below. Return to Spacecraft Designer to adjust component configurations and propellant loading."}
          </p>
        </div>

        <div className="banner-decision-side">
          {isReady ? (
            <button
              type="button"
              className="stitch-btn stitch-btn-launch-hero"
              onClick={onLaunch}
            >
              <Rocket size={20} />
              <span>GO FOR LAUNCH</span>
              <ArrowRight size={18} />
            </button>
          ) : (
            <button
              type="button"
              className="stitch-btn stitch-btn-secondary"
              onClick={() => onNavigate("designer")}
            >
              <ArrowLeft size={16} />
              <span>RESOLVE ERRORS</span>
            </button>
          )}
        </div>
      </div>

      {/* Active Errors / Warnings Display if Any */}
      {readiness.errors.length > 0 ? (
        <div className="readiness-alerts-card error-card mb-4">
          <div className="alerts-card-header">
            <AlertOctagon size={16} className="text-danger" />
            <strong className="text-danger">CRITICAL LAUNCH BLOCKERS ({readiness.errors.length})</strong>
          </div>
          <ul className="alerts-list">
            {readiness.errors.map((err) => (
              <li key={err} className="alert-item error-item font-tnum">
                <XCircle size={14} className="text-danger shrink-0" />
                <span>{err}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {readiness.warnings.length > 0 ? (
        <div className="readiness-alerts-card warning-card mb-4">
          <div className="alerts-card-header">
            <AlertTriangle size={16} className="text-amber" />
            <strong className="text-amber">NON-BLOCKING ADVISORIES ({readiness.warnings.length})</strong>
          </div>
          <ul className="alerts-list">
            {readiness.warnings.map((warn) => (
              <li key={warn} className="alert-item warning-item font-tnum">
                <AlertTriangle size={14} className="text-amber shrink-0" />
                <span>{warn}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* Discrete Checklist Matrix Table */}
      <section className="checklist-matrix-section">
        <div className="section-header-row">
          <div>
            <span className="panel-kicker">SUBSYSTEM CRITERIA MATRIX</span>
            <h2 className="panel-title">Verification Checklist</h2>
          </div>
          <span className="panel-tag font-tnum">
            {checklistItems.filter((i) => i.passed).length} / {checklistItems.length} PASSING
          </span>
        </div>

        <div className="checklist-items-grid font-tnum">
          {checklistItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className={`check-card ${item.passed ? "passed-card" : "failed-card"}`}
              >
                <div className="check-card-header">
                  <div className="check-icon-wrap">
                    <Icon size={16} />
                  </div>
                  <div className="check-title-block">
                    <strong className="check-name">{item.name}</strong>
                    <span className="check-rule">{item.rule}</span>
                  </div>
                  <div className="check-badge">
                    {item.passed ? (
                      <span className="badge-pass">
                        <CheckCircle2 size={13} /> GO
                      </span>
                    ) : (
                      <span className="badge-fail">
                        <XCircle size={13} /> NO-GO
                      </span>
                    )}
                  </div>
                </div>

                {!item.passed ? (
                  <div className="check-error-text">
                    <span>{item.error || item.warning}</span>
                  </div>
                ) : (
                  <div className="check-success-text">
                    <span>Requirement satisfied. Flight envelope verified.</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer Navigation Bar */}
      <div className="screen-footer-actions-row mt-6">
        <button
          type="button"
          className="stitch-btn stitch-btn-secondary"
          onClick={() => onNavigate("designer")}
        >
          <ArrowLeft size={16} />
          <span>ADJUST CONFIGURATION IN DESIGNER</span>
        </button>

        {isReady ? (
          <button
            type="button"
            className="stitch-btn stitch-btn-launch-hero"
            onClick={onLaunch}
          >
            <Rocket size={18} />
            <span>AUTHORIZE & COMMENCE LAUNCH</span>
            <ArrowRight size={16} />
          </button>
        ) : (
          <button
            type="button"
            className="stitch-btn stitch-btn-disabled"
            disabled
            title="Resolve all critical errors to enable launch authorization"
          >
            <span>LAUNCH PROHIBITED (AWAITING RESOLUTION)</span>
          </button>
        )}
      </div>
    </div>
  );
}

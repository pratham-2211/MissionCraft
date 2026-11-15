import {
  DollarSign,
  Layers,
  Fuel,
  Zap,
  ArrowRight,
  ArrowLeft,
  LifeBuoy,
  Scale,
  CheckCircle2,
} from "lucide-react";
import { COMPONENT_CATALOG } from "../../simulation/spacecraftConfig.js";

export default function ResourceManagementScreen({
  onNavigate,
  game,
  resources,
  activeMission,
}) {
  const selectedIds = game.spacecraft.selectedComponentIds || [];
  const installedComponents = COMPONENT_CATALOG.filter((c) =>
    selectedIds.includes(c.id)
  );

  const totalLaunchMass = resources.totalMassKg + resources.fuelKg;
  const massMargin = (activeMission.maxLaunchMassKg || 1500) - totalLaunchMass;
  const fuelMargin = resources.fuelKg - (activeMission.minFuelKg || 300);
  const isBudgetOk = resources.remainingBudget >= 0;
  const isMassOk = massMargin >= 0;
  const isFuelOk = fuelMargin >= 0;
  const isPowerOk = resources.powerBalanceW >= (activeMission.requiredPowerBalanceW || 0);

  return (
    <div className="stitch-screen resource-management-screen">
      {/* Header */}
      <section className="screen-header-block mb-4">
        <div className="screen-kicker-row">
          <span className="screen-kicker">
            <Scale size={14} className="text-secondary" />
            FLIGHT RESOURCE AUDIT // {activeMission.name.toUpperCase()}
          </span>
          <span className="panel-badge font-tnum">
            ENGINE CALCULATED DATA
          </span>
        </div>
        <h1 className="screen-title">RESOURCE TELEMETRY AUDIT</h1>
        <p className="screen-subtitle">
          Real-time verification of spacecraft mass properties, power generation, propellant reserves, and expenditure allocations computed by the game engine.
        </p>
      </section>

      {/* 4 Large High-Contrast Resource Cards */}
      <div className="resource-dashboard-grid font-tnum">
        {/* Card 1: Financial Budget */}
        <div className={`resource-card ${isBudgetOk ? "tone-blue" : "tone-danger"}`}>
          <div className="resource-card-top">
            <div className="flex items-center gap-2">
              <DollarSign size={18} className="text-secondary" />
              <span className="resource-label">MISSION BUDGET</span>
            </div>
            <span className={`resource-status-pill ${isBudgetOk ? "text-success" : "text-danger"}`}>
              {isBudgetOk ? "IN BUDGET" : "DEFICIT"}
            </span>
          </div>

          <div className="resource-main-val">
            ${(resources.remainingBudget / 1000).toLocaleString()}k
          </div>
          <span className="resource-detail-text">
            Remaining of $6,000,000 total mission allocation
          </span>

          <div className="meter-track mt-3">
            <div
              className={`meter-bar ${isBudgetOk ? "bg-primary" : "bg-danger"}`}
              style={{
                width: `${Math.min(100, Math.max(0, (resources.totalCost / 6000000) * 100))}%`,
              }}
            />
          </div>

          <div className="resource-card-meta">
            <span>EXPENDED: ${(resources.totalCost / 1000).toLocaleString()}k</span>
            <span>BURD: {Math.round((resources.totalCost / 6000000) * 100)}%</span>
          </div>
        </div>

        {/* Card 2: Mass Budget */}
        <div className={`resource-card ${isMassOk ? "tone-blue" : "tone-danger"}`}>
          <div className="resource-card-top">
            <div className="flex items-center gap-2">
              <Layers size={18} className="text-secondary" />
              <span className="resource-label">LAUNCH MASS</span>
            </div>
            <span className={`resource-status-pill ${isMassOk ? "text-success" : "text-danger"}`}>
              {isMassOk ? `+${massMargin} kg MARGIN` : "OVERWEIGHT"}
            </span>
          </div>

          <div className="resource-main-val">{totalLaunchMass} kg</div>
          <span className="resource-detail-text">
            Dry mass ({resources.totalMassKg} kg) + Propellant ({resources.fuelKg} kg)
          </span>

          <div className="meter-track mt-3">
            <div
              className={`meter-bar ${isMassOk ? "bg-secondary" : "bg-danger"}`}
              style={{
                width: `${Math.min(100, (totalLaunchMass / (activeMission.maxLaunchMassKg || 1500)) * 100)}%`,
              }}
            />
          </div>

          <div className="resource-card-meta">
            <span>LIMIT: {activeMission.maxLaunchMassKg} kg</span>
            <span>CAPACITY: {Math.round((totalLaunchMass / (activeMission.maxLaunchMassKg || 1500)) * 100)}%</span>
          </div>
        </div>

        {/* Card 3: Electrical Power */}
        <div className={`resource-card ${isPowerOk ? "tone-blue" : "tone-danger"}`}>
          <div className="resource-card-top">
            <div className="flex items-center gap-2">
              <Zap size={18} className="text-success" />
              <span className="resource-label">POWER BALANCE</span>
            </div>
            <span className={`resource-status-pill ${isPowerOk ? "text-success" : "text-danger"}`}>
              {isPowerOk ? "SUFFICIENT" : "DEFICIT"}
            </span>
          </div>

          <div className="resource-main-val">
            {resources.powerBalanceW > 0 ? `+${resources.powerBalanceW}` : resources.powerBalanceW} W
          </div>
          <span className="resource-detail-text">
            Solar generation (+{resources.powerGenerationW}W) vs payload draw (-{resources.powerConsumptionW}W)
          </span>

          <div className="meter-track mt-3">
            <div
              className={`meter-bar ${isPowerOk ? "bg-success" : "bg-danger"}`}
              style={{
                width: `${Math.min(100, Math.max(10, (resources.powerGenerationW / 500) * 100))}%`,
              }}
            />
          </div>

          <div className="resource-card-meta">
            <span>STORAGE: {resources.batteryCapacityWh} Wh</span>
            <span>DRAIN: {resources.powerConsumptionW} W</span>
          </div>
        </div>

        {/* Card 4: Propellant Reserve */}
        <div className={`resource-card ${isFuelOk ? "tone-blue" : "tone-amber"}`}>
          <div className="resource-card-top">
            <div className="flex items-center gap-2">
              <Fuel size={18} className="text-amber" />
              <span className="resource-label">PROPELLANT RESERVE</span>
            </div>
            <span className={`resource-status-pill ${isFuelOk ? "text-success" : "text-amber"}`}>
              {isFuelOk ? `+${fuelMargin} kg SURPLUS` : "DEFICIT"}
            </span>
          </div>

          <div className="resource-main-val">{resources.fuelKg} kg</div>
          <span className="resource-detail-text">
            Loaded fuel in tanks (Capacity: {resources.fuelCapacityKg} kg)
          </span>

          <div className="meter-track mt-3">
            <div
              className="meter-bar bg-amber"
              style={{
                width: `${Math.min(100, (resources.fuelKg / 500) * 100)}%`,
              }}
            />
          </div>

          <div className="resource-card-meta">
            <span>REQUIRED FOR ΔV: {activeMission.minFuelKg} kg</span>
            <span>RESERVE: {fuelMargin >= 0 ? `${fuelMargin} kg` : `MISSING ${Math.abs(fuelMargin)} kg`}</span>
          </div>
        </div>
      </div>

      {/* Installed Subsystem Breakdown Table */}
      <section className="subsystems-table-section mt-6">
        <div className="section-header-row">
          <div>
            <span className="panel-kicker">DETAILED BREAKDOWN</span>
            <h2 className="panel-title">Installed Hardware Subsystems</h2>
          </div>
          <span className="panel-tag font-tnum">
            {installedComponents.length} COMPONENTS CHARGED
          </span>
        </div>

        <div className="table-wrapper font-tnum">
          <table className="avionics-table">
            <thead>
              <tr>
                <th>SUBSYSTEM NAME</th>
                <th>CATEGORY</th>
                <th>UNIT COST</th>
                <th>MASS (KG)</th>
                <th>POWER SPECS</th>
                <th>CAPACITY</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {installedComponents.map((c) => (
                <tr key={c.id}>
                  <td>
                    <strong>{c.name}</strong>
                  </td>
                  <td className="uppercase text-muted">{c.category}</td>
                  <td>${(c.cost / 1000).toLocaleString()}k</td>
                  <td>{c.massKg} kg</td>
                  <td>
                    {c.powerGenerationW ? (
                      <span className="text-success">+{c.powerGenerationW}W Gen</span>
                    ) : c.powerConsumptionW ? (
                      <span className="text-danger">-{c.powerConsumptionW}W Draw</span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>
                    {c.fuelCapacityKg ? (
                      <span className="text-secondary">{c.fuelCapacityKg} kg Tank</span>
                    ) : c.batteryCapacityWh ? (
                      <span className="text-amber">{c.batteryCapacityWh} Wh Storage</span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>
                    <span className="status-tag-active">
                      <CheckCircle2 size={12} /> ACTIVE
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Flight Director Advisory Note */}
      <section className="advisory-panel-box mt-6">
        <div className="advisory-icon-col">
          <LifeBuoy size={24} className="text-secondary" />
        </div>
        <div className="advisory-content">
          <span className="advisory-kicker">FLIGHT DIRECTOR OPERATIONAL ADVISORY</span>
          <h3 className="advisory-title">Propellant and Power Margin Protocol</h3>
          <p className="advisory-desc">
            All orbital insertion burns require strict compliance with minimum fuel margins. Underpowered systems will fail to maintain orientation and communication relays during solar eclipse periods. Resolve all warnings before presenting the vehicle for Flight Readiness Review (FRR).
          </p>
        </div>
        <button
          type="button"
          className="stitch-btn stitch-btn-secondary shrink-0"
          onClick={() => onNavigate("designer")}
        >
          RESOLVE IN CATALOG →
        </button>
      </section>

      {/* Action Footer Navigation */}
      <div className="screen-footer-actions-row mt-6">
        <button
          type="button"
          className="stitch-btn stitch-btn-secondary"
          onClick={() => onNavigate("designer")}
        >
          <ArrowLeft size={16} />
          <span>RETURN TO DESIGNER</span>
        </button>

        <button
          type="button"
          className="stitch-btn stitch-btn-primary"
          onClick={() => onNavigate("readiness")}
        >
          <span>PROCEED TO LAUNCH READINESS VALIDATION</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}

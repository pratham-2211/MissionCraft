import { useState } from "react";
import {
  Rocket,
  Cpu,
  Layers,
  Battery,
  Camera,
  Radio,
  Plus,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
  ShieldCheck,
  Fuel,
  Zap,
  DollarSign,
} from "lucide-react";

export default function SpacecraftDesignerScreen({
  onNavigate,
  game,
  resources,
  activeMission,
  componentCatalog,
  onInstallComponent,
  onUninstallComponent,
  onLoadFuel,
  onResetMission,
}) {
  const [fuelSliderVal, setFuelSliderVal] = useState(game.spacecraft.fuelKg || 320);

  const selectedIds = game.spacecraft.selectedComponentIds || [];

  const handleFuelChange = (val) => {
    const num = Math.max(0, Math.min(500, Number(val) || 0));
    setFuelSliderVal(num);
    onLoadFuel(num);
  };

  const getComponentIcon = (id) => {
    switch (id) {
      case "rocket":
        return Rocket;
      case "spacecraft-bus":
        return Layers;
      case "fuel-tank":
        return Fuel;
      case "solar-panel":
        return Zap;
      case "battery":
        return Battery;
      case "camera":
        return Camera;
      case "antenna":
        return Radio;
      default:
        return Cpu;
    }
  };

  // Launch mass calculation
  const totalLaunchMassKg = resources.totalMassKg + resources.fuelKg;
  const isMassExceeded = totalLaunchMassKg > (activeMission.maxLaunchMassKg || 1500);
  const isFuelInsufficient = resources.fuelKg < (activeMission.minFuelKg || 300);
  const isPowerDeficit = resources.powerBalanceW < (activeMission.requiredPowerBalanceW || 0);
  const isBudgetExceeded = resources.remainingBudget < 0;

  return (
    <div className="stitch-screen spacecraft-designer-screen">
      {/* Top Header Row */}
      <section className="screen-header-block mb-4">
        <div className="screen-kicker-row">
          <span className="screen-kicker">
            <Cpu size={14} className="text-secondary" />
            VEHICLE HARDWARE ASSEMBLY // {activeMission.name.toUpperCase()}
          </span>
          <div className="flex items-center gap-2 font-tnum">
            <span className="badge-installed-count">
              {selectedIds.length} / {componentCatalog.length} SUBSYSTEMS INSTALLED
            </span>
            <button
              type="button"
              className="stitch-btn-tiny"
              onClick={onResetMission}
              title="Reset Spacecraft to Default"
            >
              <RotateCcw size={12} />
              <span>RESET</span>
            </button>
          </div>
        </div>
        <h1 className="screen-title">ENGINEER YOUR SPACECRAFT</h1>
        <p className="screen-subtitle">
          Mount avionics, structural frames, propulsion systems, and scientific instrumentation. All telemetry calculations are dynamically executed by the flight engine.
        </p>
      </section>

      {/* 3-Column Command Bay Grid */}
      <div className="designer-three-column-grid">
        {/* Left Column: Component Catalog */}
        <div className="designer-catalog-col">
          <div className="column-panel-header">
            <div>
              <span className="panel-kicker">EQUIPMENT MANIFEST</span>
              <h2 className="panel-title">Component Catalog</h2>
            </div>
            <span className="panel-tag font-tnum">7 FLIGHT MODULES</span>
          </div>

          <div className="catalog-scroll-list">
            {componentCatalog.map((comp) => {
              const isInstalled = selectedIds.includes(comp.id);
              const Icon = getComponentIcon(comp.id);
              const isMandatory = activeMission.requiredComponentIds?.includes(comp.id);

              return (
                <div
                  key={comp.id}
                  className={`catalog-component-card ${isInstalled ? "is-mounted" : ""}`}
                >
                  <div className="comp-card-top">
                    <div className="comp-icon-box">
                      <Icon size={18} />
                    </div>
                    <div className="comp-name-group">
                      <div className="flex items-center gap-1.5">
                        <strong className="comp-name">{comp.name}</strong>
                        {isMandatory ? (
                          <span className="comp-req-badge">REQ</span>
                        ) : null}
                      </div>
                      <span className="comp-category uppercase">{comp.category}</span>
                    </div>

                    <button
                      type="button"
                      className={`mount-toggle-btn ${isInstalled ? "mounted" : ""}`}
                      onClick={() => {
                        if (isInstalled) {
                          onUninstallComponent(comp.id);
                        } else {
                          onInstallComponent(comp.id);
                        }
                      }}
                    >
                      {isInstalled ? (
                        <>
                          <CheckCircle2 size={13} />
                          <span>INSTALLED</span>
                        </>
                      ) : (
                        <>
                          <Plus size={13} />
                          <span>INSTALL</span>
                        </>
                      )}
                    </button>
                  </div>

                  <p className="comp-desc">{comp.description}</p>

                  <div className="comp-specs-bar font-tnum">
                    <span>
                      COST: <strong>${(comp.cost / 1000).toLocaleString()}k</strong>
                    </span>
                    <span>
                      MASS: <strong>{comp.massKg} kg</strong>
                    </span>
                    {comp.fuelCapacityKg ? (
                      <span className="text-secondary">
                        CAP: <strong>{comp.fuelCapacityKg} kg</strong>
                      </span>
                    ) : null}
                    {comp.powerGenerationW ? (
                      <span className="text-success">
                        GEN: <strong>+{comp.powerGenerationW}W</strong>
                      </span>
                    ) : null}
                    {comp.powerConsumptionW ? (
                      <span className="text-danger">
                        DRAW: <strong>-{comp.powerConsumptionW}W</strong>
                      </span>
                    ) : null}
                    {comp.batteryCapacityWh ? (
                      <span className="text-amber">
                        BAT: <strong>{comp.batteryCapacityWh}Wh</strong>
                      </span>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Fuel Loading Subsystem Controls */}
          <div className="fuel-loader-box">
            <div className="fuel-loader-header">
              <span className="fuel-loader-title">
                <Fuel size={14} className="text-amber" />
                PROPELLANT LOAD CONTROL
              </span>
              <span className="fuel-loader-val font-tnum">
                <strong>{fuelSliderVal}</strong> / {resources.fuelCapacityKg} kg
              </span>
            </div>

            <input
              type="range"
              min="0"
              max={Math.max(500, resources.fuelCapacityKg || 500)}
              step="10"
              value={fuelSliderVal}
              onChange={(e) => handleFuelChange(e.target.value)}
              className="fuel-slider-input"
              disabled={!selectedIds.includes("fuel-tank")}
            />

            <div className="fuel-presets-row font-tnum">
              <button
                type="button"
                className="fuel-preset-btn"
                onClick={() => handleFuelChange(100)}
                disabled={!selectedIds.includes("fuel-tank")}
              >
                100 kg (LEO)
              </button>
              <button
                type="button"
                className="fuel-preset-btn"
                onClick={() => handleFuelChange(300)}
                disabled={!selectedIds.includes("fuel-tank")}
              >
                300 kg (MOON)
              </button>
              <button
                type="button"
                className="fuel-preset-btn"
                onClick={() => handleFuelChange(450)}
                disabled={!selectedIds.includes("fuel-tank")}
              >
                450 kg (MARS)
              </button>
              <button
                type="button"
                className="fuel-preset-btn"
                onClick={() => handleFuelChange(500)}
                disabled={!selectedIds.includes("fuel-tank")}
              >
                500 kg (MAX)
              </button>
            </div>
            {!selectedIds.includes("fuel-tank") ? (
              <span className="fuel-warning-note">
                <AlertTriangle size={12} /> Install a Fuel Tank component first to load propellant.
              </span>
            ) : null}
          </div>
        </div>

        {/* Center Column: 2D/3D Spacecraft Assembly Viewport */}
        <div className="designer-viewport-col">
          <div className="viewport-panel-header">
            <div>
              <span className="panel-kicker">SCHEMATIC INTEGRATION</span>
              <h2 className="panel-title">Vehicle Assembly Bay</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="panel-badge font-tnum">
                <span className="stitch-pulse-dot" /> ACTIVE FRAME
              </span>
            </div>
          </div>

          <div className="assembly-schematic-canvas">
            {/* Grid & Axis Overlays */}
            <div className="schematic-grid-bg" />

            <div className="schematic-axis axis-top">Y+ ORBITAL APEX</div>
            <div className="schematic-axis axis-bottom">Y- THRUST VECTOR</div>
            <div className="schematic-axis axis-left">X- PORT ARRAY</div>
            <div className="schematic-axis axis-right">X+ STBD ARRAY</div>

            {/* Modular Spacecraft Visual Representation */}
            <div className="schematic-craft-container">
              {/* Antenna Boom (Top) */}
              <div
                className={`schematic-slot antenna-slot ${
                  selectedIds.includes("antenna") ? "active-slot" : "empty-slot"
                }`}
              >
                <div className="slot-pulse" />
                <Radio size={20} />
                <span className="slot-label">COMMS ANTENNA</span>
              </div>

              {/* Scientific Payload / Camera (Upper Nose) */}
              <div
                className={`schematic-slot camera-slot ${
                  selectedIds.includes("camera") ? "active-slot" : "empty-slot"
                }`}
              >
                <div className="slot-pulse" />
                <Camera size={20} />
                <span className="slot-label">SCIENCE SENSOR</span>
              </div>

              {/* Solar Array Wings (Left & Right) */}
              <div
                className={`schematic-slot solar-left-slot ${
                  selectedIds.includes("solar-panel") ? "active-slot" : "empty-slot"
                }`}
              >
                <Zap size={22} />
                <span className="slot-label">PORT ARRAY (+250W)</span>
              </div>

              <div
                className={`schematic-slot solar-right-slot ${
                  selectedIds.includes("solar-panel") ? "active-slot" : "empty-slot"
                }`}
              >
                <Zap size={22} />
                <span className="slot-label">STBD ARRAY (+250W)</span>
              </div>

              {/* Central Spacecraft Bus (Core) */}
              <div
                className={`schematic-slot bus-core-slot ${
                  selectedIds.includes("spacecraft-bus") ? "active-slot" : "empty-slot"
                }`}
              >
                <Layers size={28} />
                <span className="slot-label">BUS PRIMARY STRUCTURE</span>
                <span className="slot-sub font-tnum">AVIONICS BAY (150 KG)</span>
              </div>

              {/* Battery & Storage Unit */}
              <div
                className={`schematic-slot battery-slot ${
                  selectedIds.includes("battery") ? "active-slot" : "empty-slot"
                }`}
              >
                <Battery size={18} />
                <span className="slot-label">
                  {selectedIds.includes("battery") ? "2000 Wh STORAGE" : "NO BATTERY"}
                </span>
              </div>

              {/* Fuel Propellant Tank (Mid-Lower) */}
              <div
                className={`schematic-slot tank-slot ${
                  selectedIds.includes("fuel-tank") ? "active-slot" : "empty-slot"
                }`}
              >
                <Fuel size={22} />
                <span className="slot-label">CRYOGENIC TANK</span>
                <span className="slot-sub font-tnum">
                  {game.spacecraft.fuelKg} kg PROPELLANT
                </span>
              </div>

              {/* Rocket Booster Stage (Base) */}
              <div
                className={`schematic-slot rocket-slot ${
                  selectedIds.includes("rocket") ? "active-slot" : "empty-slot"
                }`}
              >
                <Rocket size={32} />
                <span className="slot-label">LAUNCH VEHICLE INTERFACE</span>
                <span className="slot-sub">ORBITAL INSERTION CLASS</span>
              </div>
            </div>

            {/* Schematic Overlay Telemetry Badges */}
            <div className="schematic-overlay-telemetry font-tnum">
              <span>DRY MASS: {resources.totalMassKg} kg</span>
              <span className="sep">•</span>
              <span>WET MASS: {totalLaunchMassKg} kg</span>
              <span className="sep">•</span>
              <span>NET POWER: {resources.powerBalanceW > 0 ? `+${resources.powerBalanceW}` : resources.powerBalanceW} W</span>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Telemetry Matrix */}
        <div className="designer-telemetry-col">
          <div className="column-panel-header">
            <div>
              <span className="panel-kicker">ENGINE TELEMETRY</span>
              <h2 className="panel-title">Resource Matrix</h2>
            </div>
            <span className="panel-tag font-tnum text-secondary">LIVE AUDIT</span>
          </div>

          <div className="telemetry-readouts-box font-tnum">
            {/* Budget Margin */}
            <div className={`readout-card ${isBudgetExceeded ? "border-danger" : ""}`}>
              <div className="readout-header">
                <span className="readout-lbl">
                  <DollarSign size={14} className="text-secondary" />
                  BUDGET MARGIN
                </span>
                <strong className={`readout-val ${isBudgetExceeded ? "text-danger" : "text-success"}`}>
                  ${(resources.remainingBudget / 1000).toLocaleString()}k
                </strong>
              </div>
              <div className="meter-track">
                <div
                  className={`meter-bar ${isBudgetExceeded ? "bg-danger" : "bg-primary"}`}
                  style={{
                    width: `${Math.min(100, Math.max(0, (resources.totalCost / 6000000) * 100))}%`,
                  }}
                />
              </div>
              <div className="readout-footer">
                <span>TOTAL COST: ${(resources.totalCost / 1000).toLocaleString()}k</span>
                <span>MAX: $6,000k</span>
              </div>
            </div>

            {/* Launch Mass */}
            <div className={`readout-card ${isMassExceeded ? "border-danger" : ""}`}>
              <div className="readout-header">
                <span className="readout-lbl">
                  <Layers size={14} className="text-secondary" />
                  TOTAL LAUNCH MASS
                </span>
                <strong className={`readout-val ${isMassExceeded ? "text-danger" : "text-secondary"}`}>
                  {totalLaunchMassKg} kg
                </strong>
              </div>
              <div className="meter-track">
                <div
                  className={`meter-bar ${isMassExceeded ? "bg-danger" : "bg-secondary"}`}
                  style={{
                    width: `${Math.min(100, (totalLaunchMassKg / (activeMission.maxLaunchMassKg || 1500)) * 100)}%`,
                  }}
                />
              </div>
              <div className="readout-footer">
                <span>DRY: {resources.totalMassKg} kg | FUEL: {resources.fuelKg} kg</span>
                <span>LIMIT: {activeMission.maxLaunchMassKg} kg</span>
              </div>
            </div>

            {/* Propellant Level */}
            <div className={`readout-card ${isFuelInsufficient ? "border-amber" : ""}`}>
              <div className="readout-header">
                <span className="readout-lbl">
                  <Fuel size={14} className="text-amber" />
                  PROPELLANT LOADED
                </span>
                <strong className={`readout-val ${isFuelInsufficient ? "text-amber" : "text-success"}`}>
                  {resources.fuelKg} kg
                </strong>
              </div>
              <div className="meter-track">
                <div
                  className="meter-bar bg-amber"
                  style={{
                    width: `${Math.min(100, (resources.fuelKg / 500) * 100)}%`,
                  }}
                />
              </div>
              <div className="readout-footer">
                <span>MIN REQUIRED: {activeMission.minFuelKg} kg</span>
                <span>CAPACITY: {resources.fuelCapacityKg} kg</span>
              </div>
            </div>

            {/* Electrical Power Balance */}
            <div className={`readout-card ${isPowerDeficit ? "border-danger" : ""}`}>
              <div className="readout-header">
                <span className="readout-lbl">
                  <Zap size={14} className="text-success" />
                  NET POWER BALANCE
                </span>
                <strong className={`readout-val ${isPowerDeficit ? "text-danger" : "text-success"}`}>
                  {resources.powerBalanceW > 0 ? `+${resources.powerBalanceW}` : resources.powerBalanceW} W
                </strong>
              </div>
              <div className="meter-track">
                <div
                  className={`meter-bar ${isPowerDeficit ? "bg-danger" : "bg-success"}`}
                  style={{
                    width: `${Math.min(100, Math.max(10, (resources.powerGenerationW / 500) * 100))}%`,
                  }}
                />
              </div>
              <div className="readout-footer">
                <span>GEN: +{resources.powerGenerationW}W | DRAW: -{resources.powerConsumptionW}W</span>
                <span>BATTERY: {resources.batteryCapacityWh} Wh</span>
              </div>
            </div>
          </div>

          {/* Quick Navigation Action Triggers */}
          <div className="designer-actions-panel">
            <button
              type="button"
              className="stitch-btn stitch-btn-secondary w-full"
              onClick={() => onNavigate("resources")}
            >
              <span>CONFIRM CONFIGURATION & AUDIT RESOURCES</span>
              <ArrowRight size={15} />
            </button>

            <button
              type="button"
              className="stitch-btn stitch-btn-primary w-full"
              onClick={() => onNavigate("readiness")}
            >
              <ShieldCheck size={16} />
              <span>VALIDATE LAUNCH READINESS</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

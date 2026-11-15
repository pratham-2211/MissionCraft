import { useState } from "react";
import {
  Moon,
  Globe2,
  Satellite,
  CheckCircle2,
  ArrowLeft,
  Clock,
  Layers,
  Fuel,
  Zap,
  Target,
  ChevronRight,
} from "lucide-react";

export default function MissionSelectionScreen({
  onNavigate,
  onSelectMission,
  activeMissionId,
  allMissions,
}) {
  const [filter, setFilter] = useState("all");

  const missionDisplayData = {
    "lunar-survey": {
      category: "CREWED / ROBOTIC EXPLORATION",
      badge: "LUNAR SURVEY",
      difficulty: "MODERATE",
      diffTone: "amber",
      distance: "384,400 KM",
      duration: "8 DAYS",
      icon: Moon,
      imgUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuC2AljBqp2f75gyn4RCoubXAmuet82RXHf5YyzmFiWiaj7XBGyIHcCFFTWfgqKoWchUpiGfIqazI9UouPsjfhYfZc2gjvOd0HuryEySDS8mR05N79AH4cjjztW6ASIqsdK2N5H1sXuTgPdS2FjC_ZYSYDaJ-sQusAhujewjKFffiSkGpGoUlHHCcmvVstnf-snjm9dFPh7uS0ErAIl3mTdpXTWFHXPfx42dZ16-PHw7",
      targetDesc: "Shackleton Crater permanent shadow zones & water-ice volatiles mapping.",
    },
    "mars-exploration": {
      category: "INTERPLANETARY DEEP SPACE",
      badge: "MARS EXPEDITION",
      difficulty: "ADVANCED",
      diffTone: "danger",
      distance: "225M KM",
      duration: "540 DAYS",
      icon: Globe2,
      imgUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuA946_S0dB2sUNx0ZL9hxjxafoMCVjP69d4ucCX3_TgUy7AKE1IPtJQXEo5D-htAB4cNExTex5ogLvmErewTOr0xxSTzqL5FCEkDcwtZJWw7QyLzy4PV2YFwjtzcJyJVVEOolOd8qt3GtNp7kjpeHUxcBDF2_0EnIJv8cxJ4cwCRvydQCbHnb8l9k3iHiEERN-Yt-MFRM1iS5K5WImT258t5JT1CzrxadTJDqvtje3g",
      targetDesc: "Jezero Crater paleo-lake sediment bed analysis and communications relay.",
    },
    "earth-observation": {
      category: "SCIENTIFIC EARTH ORBIT",
      badge: "EARTH SCIENCE",
      difficulty: "FOUNDATION",
      diffTone: "success",
      distance: "700 KM ALTITUDE",
      duration: "180 DAYS",
      icon: Satellite,
      imgUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBSpZifsxAzxyFGWJe16Q6ZvgBjAsmkOmyb-RgdVxsNMkpWB7R-epcy8b5opPNogJc0H1nto4eUAmxkdF6e7wWstxjHbAxtacJHZOJgPqgPGUH09Yq5yUDyHi6UrllleQILlKgeUqh6WQVyIjib2cMYh79K62Ad_kiowhd-uH6NsZuepgR1VslgCO7h0u5LsciYM7-16GcIreBtLpX4uyg-YjPc5knaaRNVPHTu_azv",
      targetDesc: "Global tropospheric greenhouse gases, cloud cover, and sea surface imaging.",
    },
  };

  const filteredMissions = allMissions.filter((m) => {
    if (filter === "lunar") return m.id === "lunar-survey";
    if (filter === "mars") return m.id === "mars-exploration";
    if (filter === "earth") return m.id === "earth-observation";
    return true;
  });

  const selectedMissionObj = allMissions.find((m) => m.id === activeMissionId) || allMissions[0];

  return (
    <div className="stitch-screen mission-selection-screen">
      {/* Directory Title Header */}
      <section className="screen-header-block">
        <div className="screen-kicker-row">
          <span className="screen-kicker">
            <Target size={14} className="text-secondary" />
            MISSION SELECTION // FLIGHT DIRECTORY
          </span>
          <span className="screen-count-pill font-tnum">03 MISSIONS ACTIVE</span>
        </div>
        <h1 className="screen-title">WHERE WILL YOU VENTURE?</h1>
        <p className="screen-subtitle">
          Select an aerospace mission profile to review operational constraints, required subsystems, and trajectory milestones before configuring your vehicle.
        </p>

        {/* Filter Tabs */}
        <div className="filter-tabs-row">
          <button
            type="button"
            className={`filter-tab ${filter === "all" ? "is-active" : ""}`}
            onClick={() => setFilter("all")}
          >
            ALL DESTINATIONS
          </button>
          <button
            type="button"
            className={`filter-tab ${filter === "lunar" ? "is-active" : ""}`}
            onClick={() => setFilter("lunar")}
          >
            LUNAR SYSTEM
          </button>
          <button
            type="button"
            className={`filter-tab ${filter === "mars" ? "is-active" : ""}`}
            onClick={() => setFilter("mars")}
          >
            MARS INTERPLANETARY
          </button>
          <button
            type="button"
            className={`filter-tab ${filter === "earth" ? "is-active" : ""}`}
            onClick={() => setFilter("earth")}
          >
            EARTH OBSERVATION
          </button>
        </div>
      </section>

      {/* Mission Cards Grid */}
      <section className="missions-selection-grid">
        {filteredMissions.map((m) => {
          const isSelected = m.id === activeMissionId;
          const display = missionDisplayData[m.id] || missionDisplayData["lunar-survey"];
          const Icon = display.icon;

          return (
            <div
              key={m.id}
              className={`mission-card-detailed ${isSelected ? "is-selected-panel" : ""}`}
            >
              {/* Image banner */}
              <div
                className="detailed-card-image"
                style={{ backgroundImage: `url('${display.imgUrl}')` }}
              >
                <div className="image-overlay-scrim" />
                <div className="card-top-tags">
                  <span className="card-cat-badge">{display.category}</span>
                  <span className={`card-diff-badge tone-${display.diffTone}`}>
                    {display.difficulty}
                  </span>
                </div>
                <div className="card-title-group">
                  <span className="card-target-kicker">TARGET DESTINATION</span>
                  <h2 className="card-mission-title">{m.name}</h2>
                </div>
              </div>

              {/* Body */}
              <div className="detailed-card-body">
                <p className="card-desc">{m.description}</p>
                <p className="card-target-detail">{display.targetDesc}</p>

                {/* Engineering constraints matrix from Member 2's engine */}
                <div className="constraints-matrix-box">
                  <div className="matrix-heading">
                    <span className="matrix-title">FLIGHT ENVELOPE REQUIREMENTS</span>
                    <span className="matrix-note font-tnum">ENGINE VERIFIED</span>
                  </div>

                  <div className="constraints-grid font-tnum">
                    <div className="constraint-cell">
                      <div className="constraint-icon">
                        <Layers size={14} className="text-secondary" />
                      </div>
                      <div className="constraint-data">
                        <span className="c-lbl">MAX LAUNCH MASS</span>
                        <strong className="c-val">{m.maxLaunchMassKg} kg</strong>
                      </div>
                    </div>

                    <div className="constraint-cell">
                      <div className="constraint-icon">
                        <Fuel size={14} className="text-amber" />
                      </div>
                      <div className="constraint-data">
                        <span className="c-lbl">MINIMUM FUEL</span>
                        <strong className="c-val">{m.minFuelKg} kg</strong>
                      </div>
                    </div>

                    <div className="constraint-cell">
                      <div className="constraint-icon">
                        <Zap size={14} className="text-success" />
                      </div>
                      <div className="constraint-data">
                        <span className="c-lbl">POWER BALANCE</span>
                        <strong className="c-val">≥ {m.requiredPowerBalanceW} W</strong>
                      </div>
                    </div>

                    <div className="constraint-cell">
                      <div className="constraint-icon">
                        <Clock size={14} className="text-primary" />
                      </div>
                      <div className="constraint-data">
                        <span className="c-lbl">MISSION DURATION</span>
                        <strong className="c-val">{display.duration}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Required Components Checklist */}
                <div className="required-components-box">
                  <span className="checklist-heading">MANDATORY SUBSYSTEM HARDWARE</span>
                  <div className="components-tags-wrap">
                    {m.requiredComponentIds.map((cid) => (
                      <span key={cid} className="component-req-tag">
                        <CheckCircle2 size={12} className="text-secondary" />
                        <span>{cid}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Mission Objectives List */}
                <div className="mission-objectives-box">
                  <span className="checklist-heading">PRIMARY MISSION OBJECTIVES</span>
                  <ul className="objectives-list">
                    {m.objectives.map((obj, idx) => (
                      <li key={obj.id} className="objective-item">
                        <span className="obj-num font-tnum">0{idx + 1}</span>
                        <div className="obj-text">
                          <strong>{obj.name}</strong>
                          <span>{obj.description}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Card Action Button */}
                <div className="card-action-bar">
                  <button
                    type="button"
                    className={`stitch-btn w-full ${
                      isSelected ? "stitch-btn-active" : "stitch-btn-primary"
                    }`}
                    onClick={() => onSelectMission(m.id)}
                  >
                    {isSelected ? (
                      <>
                        <CheckCircle2 size={16} />
                        <span>CURRENTLY SELECTED</span>
                      </>
                    ) : (
                      <>
                        <Icon size={16} />
                        <span>SELECT {m.name.toUpperCase()}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* Floating Bottom Navigation Bar */}
      <div className="mission-sticky-bottom-bar">
        <div className="bottom-bar-inner">
          <div className="bottom-selected-info">
            <span className="bottom-dot stitch-pulse-dot" />
            <div>
              <span className="bottom-kicker">SELECTED FLIGHT ASSIGNMENT</span>
              <strong className="bottom-name">{selectedMissionObj.name}</strong>
            </div>
            <div className="bottom-meta font-tnum hide-mobile">
              <span>MAX MASS: {selectedMissionObj.maxLaunchMassKg} kg</span>
              <span className="sep">•</span>
              <span>MIN FUEL: {selectedMissionObj.minFuelKg} kg</span>
            </div>
          </div>

          <div className="bottom-actions-row">
            <button
              type="button"
              className="stitch-btn stitch-btn-secondary"
              onClick={() => onNavigate("command-center")}
            >
              <ArrowLeft size={15} />
              <span>COMMAND CENTER</span>
            </button>

            <button
              type="button"
              className="stitch-btn stitch-btn-primary"
              onClick={() => onNavigate("designer")}
            >
              <span>PROCEED TO SPACECRAFT DESIGNER</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

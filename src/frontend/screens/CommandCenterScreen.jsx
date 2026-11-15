import { useState } from "react";
import {
  Rocket,
  Compass,
  ArrowRight,
  TrendingUp,
  Target,
  Cpu,
  Scale,
  ClipboardCheck,
  Radio,
  ChevronRight,
  Satellite,
} from "lucide-react";

export default function CommandCenterScreen({
  onNavigate,
  onSelectMission,
  activeMissionId,
}) {
  const [projectionMode, setProjectionMode] = useState("3D");

  const stageList = [
    {
      num: "01",
      title: "SELECT MISSION",
      desc: "Choose mission profile: Earth Observation, Lunar Surveyor, or Deep Space Mars Expedition with targeted orbital constraints.",
      step: "STEP 01/05",
      screen: "missions",
      icon: Target,
      color: "cyan",
    },
    {
      num: "02",
      title: "CONFIGURE CRAFT",
      desc: "Snap avionics, high-efficiency solar arrays, chemical thrusters, and scientific payloads into modular bus mountpoints.",
      step: "STEP 02/05",
      screen: "designer",
      icon: Cpu,
      color: "blue",
    },
    {
      num: "03",
      title: "BALANCE RESOURCES",
      desc: "Audit wet vs. dry mass, calculate mission Delta-V margins, thermal dissipation, and electrical power generation (W).",
      step: "STEP 03/05",
      screen: "resources",
      icon: Scale,
      color: "amber",
    },
    {
      num: "04",
      title: "VALIDATE READINESS",
      desc: "Execute NASA Flight Readiness Review (FRR) audits. Inspect redundancy safety triggers and launch vehicle clearance.",
      step: "STEP 04/05",
      screen: "readiness",
      icon: ClipboardCheck,
      color: "green",
    },
    {
      num: "05",
      title: "MISSION CONTROL",
      desc: "Ignite launch sequence, manage orbital trajectory corrections in real-time 3D, and successfully capture target science data.",
      step: "STEP 05/05",
      screen: "mission-control",
      icon: Radio,
      color: "purple",
    },
  ];

  const missionCardData = [
    {
      id: "lunar-survey",
      badge: "LUNAR SURVEY",
      difficulty: "MODERATE",
      diffColor: "amber",
      title: "Shackleton Crater Expedition",
      desc: "Insert a high-inclination lunar polar orbiter to map permanently shadowed water-ice deposits utilizing synthetic aperture radar and neutron spectrometry.",
      estDv: "3,940 m/s",
      payloadCap: "1,500 kg",
      orbitClass: "Polar LLO (100km)",
      budget: "$6.0M",
      scienceGoal: "Water-Ice Mapping",
      imgUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuC2AljBqp2f75gyn4RCoubXAmuet82RXHf5YyzmFiWiaj7XBGyIHcCFFTWfgqKoWchUpiGfIqazI9UouPsjfhYfZc2gjvOd0HuryEySDS8mR05N79AH4cjjztW6ASIqsdK2N5H1sXuTgPdS2FjC_ZYSYDaJ-sQusAhujewjKFffiSkGpGoUlHHCcmvVstnf-snjm9dFPh7uS0ErAIl3mTdpXTWFHXPfx42dZ16-PHw7",
    },
    {
      id: "mars-exploration",
      badge: "DEEP SPACE INTERPLANETARY",
      difficulty: "ADVANCED",
      diffColor: "danger",
      title: "Jezero Crater Relay & Lander",
      desc: "Conduct interplanetary transit, hyperbolic aerocapture, and deployment of a science rover package with long-range orbiter communications relay link.",
      estDv: "5,820 m/s",
      payloadCap: "2,000 kg",
      orbitClass: "Areocentric Aero (350km)",
      budget: "$6.0M",
      scienceGoal: "Biosignature Analysis",
      imgUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuA946_S0dB2sUNx0ZL9hxjxafoMCVjP69d4ucCX3_TgUy7AKE1IPtJQXEo5D-htAB4cNExTex5ogLvmErewTOr0xxSTzqL5FCEkDcwtZJWw7QyLzy4PV2YFwjtzcJyJVVEOolOd8qt3GtNp7kjpeHUxcBDF2_0EnIJv8cxJ4cwCRvydQCbHnb8l9k3iHiEERN-Yt-MFRM1iS5K5WImT258t5JT1CzrxadTJDqvtje3g",
    },
    {
      id: "earth-observation",
      badge: "EARTH SCIENCE",
      difficulty: "FOUNDATION",
      diffColor: "success",
      title: "Blue Sentinel Climate Monitor",
      desc: "Deploy an Earth-observing satellite constellation node to measure tropospheric greenhouse gas emissions, sea-surface temperature, and polar glacier retreat.",
      estDv: "2,150 m/s",
      payloadCap: "1,000 kg",
      orbitClass: "Sun-Synch LEO (700km)",
      budget: "$6.0M",
      scienceGoal: "Climate Atmospheric Watch",
      imgUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBSpZifsxAzxyFGWJe16Q6ZvgBjAsmkOmyb-RgdVxsNMkpWB7R-epcy8b5opPNogJc0H1nto4eUAmxkdF6e7wWstxjHbAxtacJHZOJgPqgPGUH09Yq5yUDyHi6UrllleQILlKgeUqh6WQVyIjib2cMYh79K62Ad_kiowhd-uH6NsZuepgR1VslgCO7h0u5LsciYM7-16GcIreBtLpX4uyg-YjPc5knaaRNVPHTu_azv",
    },
  ];

  return (
    <div className="stitch-screen command-center-screen">
      {/* Top Telemetry Status Ribbon */}
      <section className="stitch-telemetry-ribbon">
        <div className="ribbon-left">
          <span className="ribbon-director-online">
            <span className="ribbon-ping-dot" />
            FLIGHT DIRECTOR ONLINE
          </span>
          <span className="ribbon-sep" />
          <span className="ribbon-muted">SUBSYSTEM: AVIONICS BUS [SYNCED]</span>
          <span className="ribbon-sep hide-mobile" />
          <span className="ribbon-muted hide-mobile">PROPULSION KINEMATICS ENGINE v4.2</span>
        </div>
        <div className="ribbon-right font-tnum">
          <span>
            ORBITAL EPOCH: <strong>2026.284.11</strong>
          </span>
          <span className="hide-mobile">
            GROUND STATION: <strong className="text-success">GOLDSTONE (DSS-14)</strong>
          </span>
          <span>
            LINK SNR: <strong className="text-secondary">+34.8 dB</strong>
          </span>
        </div>
      </section>

      {/* Hero Cinematic Section */}
      <section className="stitch-hero-section">
        <div className="stitch-hero-grid">
          {/* Left Column: Narrative & Actions */}
          <div className="hero-copy-col">
            <div className="hero-kicker-badge">
              <Rocket size={15} className="text-secondary" />
              <span className="kicker-brand">MISSIONCRAFT</span>
              <span className="kicker-dash">—</span>
              <span className="kicker-tag">DESIGN. LAUNCH. MANAGE. EXPLORE.</span>
            </div>

            <h1 className="hero-headline">
              YOUR MISSION.
              <br />
              <span className="hero-headline-gradient">YOUR UNIVERSE.</span>
            </h1>

            <p className="hero-body-text">
              Design precision spacecraft, balance flight resources, validate launch readiness, and guide exploration missions through an interactive aerospace simulation engine.
            </p>

            <div className="hero-cta-row">
              <button
                type="button"
                className="stitch-btn stitch-btn-primary"
                onClick={() => onNavigate("missions")}
              >
                <Rocket size={16} />
                <span>START YOUR MISSION</span>
                <ArrowRight size={16} />
              </button>

              <button
                type="button"
                className="stitch-btn stitch-btn-secondary"
                onClick={() => onNavigate("missions")}
              >
                <Compass size={16} />
                <span>EXPLORE MISSIONS</span>
              </button>
            </div>

            {/* Real-time simulation metrics box */}
            <div className="hero-metrics-card">
              <div className="metrics-card-header">
                <span className="metrics-card-title">
                  <span className="stitch-pulse-dot" />
                  REAL-TIME SIMULATION METRICS
                </span>
                <span className="metrics-card-sub font-tnum">ACCURACY: 99.984%</span>
              </div>
              <div className="metrics-grid">
                <div className="metrics-cell">
                  <span className="cell-label">ACTIVE SIMS</span>
                  <div className="cell-num font-tnum">1,420</div>
                  <span className="cell-delta text-success font-tnum">
                    <TrendingUp size={12} /> +14.2%
                  </span>
                </div>
                <div className="metrics-cell">
                  <span className="cell-label">TOTAL ΔV COMPUTED</span>
                  <div className="cell-num cell-cyan font-tnum">
                    48,200 <small>km/s</small>
                  </div>
                  <span className="cell-sub font-tnum">RK4 INTEGRATOR</span>
                </div>
                <div className="metrics-cell">
                  <span className="cell-label">MISSION SUCCESS</span>
                  <div className="cell-num text-success font-tnum">94.2%</div>
                  <span className="cell-sub font-tnum">6,840 RUNS</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Orbital Trajectory Viewport */}
          <div className="hero-viewport-col">
            <div className="orbital-canvas-frame">
              {/* Starfield / Deep Space Background */}
              <div
                className="orbital-underlay-image"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDL4YNUmNQiAUt-16dXPuV06KKutff_ivEll483dpDTsYZZI2c4N5UADt_0gJduKRaiivr9E45Ewq9MGXMPa6xBXDh7E0LatGofgD8eMmtJG_vrjrouizZH7nZbvmUhXVuQg4xlxvEd5zCodLxDKM9Zb1DLh-L8XzcbgQ6curpLnd8qEMQg1olnBKZPG0VfYoeM5jcejLD3ErgLzLoALbUCIja9BlILOT0CYpy8a94E')",
                }}
              />

              {/* Trajectory Vector Graphics (SVG) */}
              <svg
                className="orbital-svg-overlay"
                viewBox="0 0 640 480"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Orbital Reference Ellipses */}
                <ellipse
                  cx="320"
                  cy="240"
                  rx="260"
                  ry="170"
                  stroke="#263750"
                  strokeDasharray="4 6"
                  strokeWidth="1.5"
                />
                <ellipse
                  cx="320"
                  cy="240"
                  rx="190"
                  ry="120"
                  stroke="#16243B"
                  strokeWidth="1"
                />
                <circle
                  cx="320"
                  cy="240"
                  r="110"
                  stroke="#263750"
                  strokeDasharray="2 4"
                  strokeWidth="1"
                />

                {/* Earth Node (LEO: 420 KM) */}
                <g transform="translate(190, 260)">
                  <circle cx="0" cy="0" r="44" stroke="#45e5fa" strokeOpacity="0.6" strokeWidth="1.5" />
                  <circle cx="0" cy="0" r="38" fill="#142440" />
                  <circle cx="0" cy="0" r="34" fill="#3B82F6" fillOpacity="0.3" />
                  <circle cx="0" cy="0" r="28" fill="#498eff" fillOpacity="0.6" />
                  <circle cx="-6" cy="-6" r="20" fill="#34D399" fillOpacity="0.25" />
                  <text
                    x="0"
                    y="58"
                    textAnchor="middle"
                    fill="#acc7ff"
                    fontSize="10"
                    fontWeight="700"
                    letterSpacing="0.1em"
                  >
                    EARTH (LEO: 420 KM)
                  </text>
                </g>

                {/* Trans-Lunar Injection Arc (Hohmann Transfer) */}
                <path
                  d="M 190 220 C 230 110, 420 80, 470 170"
                  stroke="#31d9ee"
                  strokeDasharray="6 4"
                  strokeLinecap="round"
                  strokeWidth="2.5"
                  className="pulse-path"
                />

                {/* Tangent Burn Vector */}
                <line x1="210" y1="180" x2="250" y2="155" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" />
                <polygon points="252,153 243,152 248,161" fill="#FBBF24" />
                <text x="260" y="152" fill="#FBBF24" fontSize="10" fontWeight="700">
                  TLI INJECTION: ΔV 3.12 km/s
                </text>

                {/* Luna Node (Periselene 110km) */}
                <g transform="translate(470, 170)">
                  <circle cx="0" cy="0" r="24" stroke="#d7e2ff" strokeDasharray="2 3" strokeOpacity="0.5" strokeWidth="1" />
                  <circle cx="0" cy="0" r="20" fill="#16243B" />
                  <circle cx="0" cy="0" r="16" fill="#91A4BF" fillOpacity="0.4" />
                  <circle cx="4" cy="-3" r="5" fill="#090e19" fillOpacity="0.5" />
                  <circle cx="-5" cy="5" r="3" fill="#090e19" fillOpacity="0.5" />
                  <text
                    x="0"
                    y="38"
                    textAnchor="middle"
                    fill="#dee2f3"
                    fontSize="10"
                    fontWeight="700"
                    letterSpacing="0.1em"
                  >
                    LUNA (PERISELENE: 110 KM)
                  </text>
                </g>

                {/* Active Spacecraft Indicator */}
                <g transform="translate(340, 120)">
                  <circle cx="0" cy="0" r="8" fill="#3988FF" opacity="0.4" className="ping-circle" />
                  <circle cx="0" cy="0" r="4" fill="#F0F6FF" />
                  <line x1="0" y1="0" x2="20" y2="-20" stroke="#31d9ee" strokeWidth="1" />
                  <rect x="22" y="-34" width="134" height="28" rx="4" fill="#091222" fillOpacity="0.92" stroke="#263750" strokeWidth="1" />
                  <text x="30" y="-20" fill="#45e5fa" fontSize="10" fontWeight="700">
                    MISSIONCRAFT-1
                  </text>
                  <text x="30" y="-10" fill="#c1c6d6" fontSize="9">
                    VEL: 10.84 km/s | AP: 384,400 km
                  </text>
                </g>

                {/* Mars Hyperbolic Vector */}
                <path
                  d="M 190 260 C 260 360, 480 430, 580 380"
                  stroke="#FB7185"
                  strokeDasharray="5 5"
                  strokeOpacity="0.6"
                  strokeWidth="1.5"
                />
                <text x="510" y="410" fill="#FB7185" fontSize="10" fontWeight="700">
                  MARS ESCAPE VECTOR
                </text>
              </svg>

              {/* Viewport Overlay Controls */}
              <div className="viewport-overlay-top">
                <button
                  type="button"
                  className={`overlay-mode-btn ${projectionMode === "2D" ? "active" : ""}`}
                  onClick={() => setProjectionMode("2D")}
                >
                  2D PROJECTION
                </button>
                <button
                  type="button"
                  className={`overlay-mode-btn ${projectionMode === "3D" ? "active" : ""}`}
                  onClick={() => setProjectionMode("3D")}
                >
                  3D ORBITAL HUD
                </button>
                <button
                  type="button"
                  className={`overlay-mode-btn ${projectionMode === "EPHEMERIS" ? "active" : ""}`}
                  onClick={() => setProjectionMode("EPHEMERIS")}
                >
                  EPHEMERIS
                </button>
              </div>

              <div className="viewport-overlay-bottom font-tnum">
                <span className="stitch-pulse-dot" />
                <span>
                  FRAME: <strong>J2000 INERTIAL</strong>
                </span>
                <span className="sep">|</span>
                <span className="text-secondary">WARP: 100x</span>
              </div>
            </div>

            {/* Telemetry Legend Mini-Bar */}
            <div className="trajectory-legend-grid">
              <div className="legend-card">
                <span className="legend-dot bg-secondary" />
                <div className="legend-copy">
                  <span className="legend-label">TRAJECTORY</span>
                  <span className="legend-val">Trans-Lunar Direct</span>
                </div>
              </div>
              <div className="legend-card">
                <span className="legend-dot bg-amber" />
                <div className="legend-copy">
                  <span className="legend-label">MANEUVER</span>
                  <span className="legend-val">TLI Apogee Kick</span>
                </div>
              </div>
              <div className="legend-card">
                <span className="legend-dot bg-danger" />
                <div className="legend-copy">
                  <span className="legend-label">ESCAPE WINDOW</span>
                  <span className="legend-val font-tnum">T-Minus 04:22:18</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Flight Lifecycle Pipeline Section */}
      <section className="stitch-pipeline-section">
        <div className="pipeline-header-row">
          <div>
            <span className="pipeline-kicker">
              <Rocket size={14} className="text-secondary" />
              FLIGHT LIFECYCLE PIPELINE
            </span>
            <h2 className="pipeline-title">HOW MISSIONCRAFT OPERATES</h2>
            <p className="pipeline-sub">
              Five synchronized stages from concept architecture to real-time orbital trajectory telemetry.
            </p>
          </div>
          <div className="pipeline-badge">
            <span>AUTOMATED SIMULATION LOOP</span>
            <span className="stitch-pulse-dot" />
          </div>
        </div>

        {/* 5 Synchronized Lifecycle Stages */}
        <div className="pipeline-stages-grid">
          {stageList.map((st) => {
            const Icon = st.icon;
            return (
              <button
                key={st.num}
                type="button"
                className={`pipeline-stage-card tone-${st.color}`}
                onClick={() => onNavigate(st.screen)}
              >
                <div className="stage-card-top">
                  <span className="stage-number font-tnum">{st.num}</span>
                  <div className="stage-icon-box">
                    <Icon size={18} />
                  </div>
                </div>
                <div className="stage-card-content">
                  <h3 className="stage-name">{st.title}</h3>
                  <p className="stage-desc">{st.desc}</p>
                </div>
                <div className="stage-card-bottom font-tnum">
                  <span className="stage-step-tag">{st.step}</span>
                  <span className="stage-arrow">→</span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Active Missions Catalog Preview */}
      <section className="stitch-missions-preview-section">
        <div className="preview-header-row">
          <div>
            <span className="pipeline-kicker">
              <Target size={14} className="text-secondary" />
              PRIMARY OPERATIONAL ASSIGNMENTS
            </span>
            <h2 className="pipeline-title">ACTIVE EXPLORATION MISSIONS</h2>
            <p className="pipeline-sub">
              Evaluate mission profiles, payload mass constraints, and propulsion requirements.
            </p>
          </div>
          <button
            type="button"
            className="stitch-btn stitch-btn-secondary"
            onClick={() => onNavigate("missions")}
          >
            <span>VIEW FULL DIRECTORY (3 MISSIONS)</span>
            <ArrowRight size={15} />
          </button>
        </div>

        <div className="missions-cards-grid">
          {missionCardData.map((m) => {
            const isSelected = activeMissionId === m.id;
            return (
              <div
                key={m.id}
                className={`mission-bento-card ${isSelected ? "is-selected-card" : ""}`}
              >
                <div
                  className="bento-image-header"
                  style={{ backgroundImage: `url('${m.imgUrl}')` }}
                >
                  <div className="bento-gradient-scrim" />
                  <div className="bento-badges-row">
                    <span className="bento-category-tag">{m.badge}</span>
                    <span className={`bento-diff-tag tone-${m.diffColor}`}>
                      {m.difficulty}
                    </span>
                  </div>
                  <div className="bento-title-block">
                    <span className="bento-dest-kicker">DESTINATION TARGET</span>
                    <h3 className="bento-title">{m.title}</h3>
                  </div>
                </div>

                <div className="bento-body">
                  <p className="bento-desc">{m.desc}</p>

                  <div className="bento-matrix font-tnum">
                    <div className="matrix-item">
                      <span className="matrix-lbl">ESTIMATED ΔV</span>
                      <strong className="matrix-val">{m.estDv}</strong>
                    </div>
                    <div className="matrix-item">
                      <span className="matrix-lbl">PAYLOAD CAP</span>
                      <strong className="matrix-val">{m.payloadCap}</strong>
                    </div>
                    <div className="matrix-item">
                      <span className="matrix-lbl">ORBIT CLASS</span>
                      <strong className="matrix-val text-secondary">{m.orbitClass}</strong>
                    </div>
                    <div className="matrix-item">
                      <span className="matrix-lbl">MAX BUDGET</span>
                      <strong className="matrix-val text-success">{m.budget}</strong>
                    </div>
                  </div>

                  <div className="bento-footer">
                    <div className="bento-science-tag">
                      <Satellite size={14} className="text-secondary" />
                      <span>{m.scienceGoal}</span>
                    </div>

                    <button
                      type="button"
                      className={`stitch-btn ${isSelected ? "stitch-btn-active" : "stitch-btn-primary"}`}
                      onClick={() => {
                        onSelectMission(m.id);
                        onNavigate("designer");
                      }}
                    >
                      <span>{isSelected ? "CONFIGURING" : "SELECT MISSION"}</span>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

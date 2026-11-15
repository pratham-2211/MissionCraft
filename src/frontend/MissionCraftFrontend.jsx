import { useMemo, useState } from "react";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  Atom,
  BatteryCharging,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Clock3,
  Compass,
  Cpu,
  Crosshair,
  Database,
  Gauge,
  Globe2,
  History,
  Layers3,
  LifeBuoy,
  LockKeyhole,
  Menu,
  Moon,
  Orbit,
  Pause,
  Play,
  Radio,
  RefreshCw,
  Rocket,
  Satellite,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Target,
  Telescope,
  TriangleAlert,
  Zap,
} from "lucide-react";
import "./MissionCraftFrontend.css";

const DEFAULT_MISSIONS = [
  {
    id: "lunar-expedition",
    name: "Lunar Expedition",
    destination: "Moon",
    code: "MC-01 / ARTEMIS",
    category: "CREWED EXPLORATION",
    difficulty: "INTERMEDIATE",
    duration: "8 DAYS",
    distance: "384,400 KM",
    description:
      "Return to the lunar surface. Plan a safe orbital insertion, deploy a lander, and establish a temporary research outpost.",
    accent: "moon",
    icon: Moon,
  },
  {
    id: "mars-exploration",
    name: "Mars Exploration",
    destination: "Mars",
    code: "MC-02 / RED FRONTIER",
    category: "DEEP SPACE EXPLORATION",
    difficulty: "ADVANCED",
    duration: "540 DAYS",
    distance: "225M KM",
    description:
      "Chart a path to the red planet. Balance a long-duration cruise, entry systems, surface operations, and return reserves.",
    accent: "mars",
    icon: Globe2,
  },
  {
    id: "earth-observation",
    name: "Earth Observation",
    destination: "Low Earth Orbit",
    code: "MC-03 / BLUE SENTINEL",
    category: "SCIENTIFIC OBSERVATION",
    difficulty: "FOUNDATION",
    duration: "180 DAYS",
    distance: "700 KM ALTITUDE",
    description:
      "Deploy an orbital observatory to monitor climate patterns, surface changes, and atmospheric conditions across Earth.",
    accent: "earth",
    icon: Satellite,
  },
];

const DEFAULT_RESOURCES = {
  budget: { percent: 68, display: "$680M", detail: "of $1.0B allocation", tone: "blue" },
  mass: { percent: 72, display: "72,400 kg", detail: "of 100,000 kg capacity", tone: "violet" },
  fuel: { percent: 84, display: "84%", detail: "usable propellant reserve", tone: "cyan" },
  power: { percent: 61, display: "61%", detail: "available power margin", tone: "amber" },
};

const DEFAULT_SPACECRAFT = [
  { id: "propulsion", name: "Orbital transfer engine", group: "PROPULSION", spec: "High-efficiency cryogenic", mass: "1,240 kg", icon: Atom, installed: true },
  { id: "habitat", name: "Crew habitat module", group: "CREW SYSTEMS", spec: "4-person life support", mass: "8,600 kg", icon: Layers3, installed: true },
  { id: "power", name: "Solar array assembly", group: "POWER SYSTEMS", spec: "Deployable multi-panel", mass: "920 kg", icon: Zap, installed: true },
  { id: "communications", name: "Deep-space comms", group: "AVIONICS", spec: "Ka-band high gain antenna", mass: "180 kg", icon: Radio, installed: false },
];

const DEFAULT_READINESS = [
  { id: "trajectory", title: "Trajectory & flight path", detail: "Mission route has been reviewed", complete: true },
  { id: "propulsion", title: "Propulsion configuration", detail: "Engine and stage configuration verified", complete: true },
  { id: "resources", title: "Resource reserves", detail: "Fuel, power, mass and budget reviewed", complete: true },
  { id: "communications", title: "Communication network", detail: "Ground station link not yet confirmed", complete: false },
  { id: "safety", title: "Safety & contingency plan", detail: "Abort and recovery procedures pending", complete: false },
];

const DEFAULT_TELEMETRY = [
  { label: "ALTITUDE", value: "—", unit: "" },
  { label: "VELOCITY", value: "—", unit: "" },
  { label: "FUEL", value: "—", unit: "" },
  { label: "MISSION ELAPSED", value: "—", unit: "" },
];

const NAV_GROUPS = [
  {
    label: "MISSION WORKSPACE",
    items: [
      { id: "overview", label: "Overview", icon: Orbit },
      { id: "missions", label: "Mission selection", icon: Target },
      { id: "designer", label: "Spacecraft designer", icon: Rocket },
      { id: "resources", label: "Resources", icon: Gauge },
    ],
  },
  {
    label: "OPERATIONS",
    items: [
      { id: "readiness", label: "Launch readiness", icon: ShieldCheck },
      { id: "control", label: "Mission control", icon: Crosshair },
      { id: "results", label: "Results & history", icon: History },
    ],
  },
];

const VIEW_TITLES = {
  overview: ["COMMAND CENTER", "Mission overview"],
  missions: ["MISSION SELECT", "Choose your destination"],
  designer: ["VEHICLE CONFIGURATION", "Spacecraft designer"],
  resources: ["FLIGHT RESOURCES", "Resource management"],
  readiness: ["PRE-LAUNCH OPERATIONS", "Launch readiness"],
  control: ["LIVE OPERATIONS", "Mission control"],
  results: ["MISSION ARCHIVE", "Results & history"],
};

function clampPercent(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return Math.min(100, Math.max(0, numeric));
}

function ResourceCard({ id, data }) {
  const iconMap = {
    budget: Database,
    mass: Layers3,
    fuel: Rocket,
    power: BatteryCharging,
  };
  const Icon = iconMap[id] || Activity;
  const percent = clampPercent(data?.percent);
  return (
    <article className={`resource-card tone-${data?.tone || "blue"}`}>
      <div className="resource-card-top">
        <span className="resource-icon"><Icon size={17} /></span>
        <span className="resource-label">{id.toUpperCase()}</span>
        <span className="resource-percent">{percent}%</span>
      </div>
      <div className="resource-value">{data?.display ?? "—"}</div>
      <div className="resource-detail">{data?.detail ?? "Awaiting engine data"}</div>
      <div className="resource-track" aria-label={`${id} ${percent}%`}>
        <span style={{ width: `${percent}%` }} />
      </div>
    </article>
  );
}

function SectionHeading({ eyebrow, title, description, action }) {
  return (
    <div className="section-heading">
      <div>
        <div className="section-eyebrow">{eyebrow}</div>
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </div>
      {action || null}
    </div>
  );
}

function MissionCard({ mission, selected, onSelect }) {
  const Icon = typeof mission.icon === "function" ? mission.icon : Globe2;
  return (
    <button
      type="button"
      className={`mission-option ${selected ? "is-selected" : ""} accent-${mission.accent || "moon"}`}
      onClick={() => onSelect(mission)}
      aria-pressed={selected}
    >
      <div className="mission-option-art">
        <div className="mission-orbit-ring" />
        <div className="mission-planet"><Icon size={34} strokeWidth={1.2} /></div>
        <span className="mission-art-code">{mission.code}</span>
      </div>
      <div className="mission-option-copy">
        <span className="mission-category">{mission.category}</span>
        <h3>{mission.name}</h3>
        <p>{mission.description}</p>
        <div className="mission-option-meta">
          <span><Clock3 size={13} /> {mission.duration}</span>
          <span><Compass size={13} /> {mission.distance}</span>
        </div>
      </div>
      <div className="mission-option-footer">
        <span>{mission.difficulty}</span>
        <span className="mission-select-label">{selected ? "SELECTED" : "SELECT MISSION"} <ArrowUpRight size={14} /></span>
      </div>
    </button>
  );
}

function SpacecraftPreview({ selectedParts }) {
  return (
    <div className="craft-preview" aria-label="Spacecraft configuration preview">
      <div className="craft-preview-grid" />
      <div className="craft-orbit orbit-one" />
      <div className="craft-orbit orbit-two" />
      <div className="craft-model">
        <div className="craft-wing craft-wing-left"><span /></div>
        <div className="craft-wing craft-wing-right"><span /></div>
        <div className="craft-body">
          <div className="craft-nose" />
          <div className="craft-window" />
          <div className="craft-core" />
          <div className="craft-engine" />
        </div>
        {selectedParts.communications ? <div className="craft-antenna" /> : null}
      </div>
      <div className="craft-preview-caption">
        <span><span className="live-dot" /> CONFIGURATION PREVIEW</span>
        <span>FIG 01 / VEHICLE ASSEMBLY</span>
      </div>
      <div className="craft-axis axis-x">X</div>
      <div className="craft-axis axis-y">Y</div>
      <div className="craft-axis axis-z">Z</div>
    </div>
  );
}

function EmptyState({ icon: Icon = Telescope, title, description, action }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon"><Icon size={25} /></div>
      <h3>{title}</h3>
      <p>{description}</p>
      {action || null}
    </div>
  );
}

export default function MissionCraftFrontend({
  activeMission,
  missions = DEFAULT_MISSIONS,
  resources = DEFAULT_RESOURCES,
  spacecraft = DEFAULT_SPACECRAFT,
  readinessItems = DEFAULT_READINESS,
  missionStatus = "DESIGN PHASE",
  telemetry = DEFAULT_TELEMETRY,
  results = null,
  history = [],
  isEngineConnected = false,
  systemStatus = "PREVIEW MODE",
  simulationViewport = null,
  onMissionSelect = () => {},
  onSpacecraftChange = () => {},
  onResourceAction = () => {},
  onReadinessChange = () => {},
  onLaunchRequest = () => {},
  onSimulationAction = () => {},
  onNavigate = () => {},
}) {
  const [currentView, setCurrentView] = useState("overview");
  const [localMissionId, setLocalMissionId] = useState(missions[0]?.id || "lunar-expedition");
  // In preview mode the component can toggle its example parts locally.
  // When Member 2 supplies spacecraft props, the engine remains the source of truth.
  const spacecraftControlled = spacecraft !== DEFAULT_SPACECRAFT;
  const [localParts, setLocalParts] = useState({});
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [notification, setNotification] = useState("");

  const controlledMissionId = typeof activeMission === "string" ? activeMission : activeMission?.id;
  const selectedMission = useMemo(
    () => missions.find((mission) => mission.id === (controlledMissionId || localMissionId)) || missions[0] || DEFAULT_MISSIONS[0],
    [missions, controlledMissionId, localMissionId],
  );
  const resourceEntries = Object.entries({ ...DEFAULT_RESOURCES, ...resources });
  const parts = spacecraft.map((part) => ({
    ...part,
    installed: spacecraftControlled ? Boolean(part.installed) : (localParts[part.id] ?? Boolean(part.installed)),
  }));
  const selectedParts = Object.fromEntries(parts.map((part) => [part.id, part.installed]));
  const completeCount = readinessItems.filter((item) => item.complete ?? item.completed).length;
  const readinessPercent = readinessItems.length ? Math.round((completeCount / readinessItems.length) * 100) : 0;
  const title = VIEW_TITLES[currentView] || VIEW_TITLES.overview;

  const navigate = (view) => {
    setCurrentView(view);
    setMobileNavOpen(false);
    onNavigate(view);
  };

  const chooseMission = (mission) => {
    setLocalMissionId(mission.id);
    onMissionSelect(mission);
    setNotification(`${mission.name.toUpperCase()} SELECTED`);
  };

  const togglePart = (part) => {
    const nextValue = !part.installed;
    if (!spacecraftControlled) {
      setLocalParts((current) => ({ ...current, [part.id]: nextValue }));
    }
    onSpacecraftChange({ partId: part.id, installed: nextValue, part });
  };

  const handleReadiness = (item) => {
    onReadinessChange({ itemId: item.id, complete: !(item.complete ?? item.completed), item });
  };

  const requestLaunch = () => {
    onLaunchRequest({ mission: selectedMission, resources, spacecraft: parts, readinessItems });
    setNotification("LAUNCH REQUEST SENT TO MISSION ENGINE");
  };

  const handleSimulation = (action) => {
    if (action === "pause" || action === "resume") setSimulationRunning(action === "resume");
    onSimulationAction(action);
  };

  return (
    <div className="mc-shell">
      <aside className={`mc-sidebar ${mobileNavOpen ? "nav-open" : ""}`}>
        <div className="mc-brand-lockup">
          <div className="mc-brand-symbol"><Orbit size={22} strokeWidth={1.7} /></div>
          <div><div className="mc-brand-name">MISSION<span>CRAFT</span></div><div className="mc-brand-sub">SPACE MISSION SIMULATOR</div></div>
        </div>

        <div className="sidebar-system-card">
          <div className="sidebar-system-top"><span className="live-dot" /> SYSTEM STATUS</div>
          <div className="sidebar-system-state">{systemStatus}</div>
          <div className="sidebar-system-meta">SIMULATION ENVIRONMENT <span>v1.0</span></div>
        </div>

        <nav className="mc-nav" aria-label="MissionCraft navigation">
          {NAV_GROUPS.map((group) => (
            <div className="mc-nav-group" key={group.label}>
              <div className="mc-nav-label">{group.label}</div>
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <button key={item.id} type="button" className={`mc-nav-item ${currentView === item.id ? "active" : ""}`} onClick={() => navigate(item.id)}>
                    <Icon size={17} strokeWidth={1.8} /><span>{item.label}</span>{currentView === item.id ? <span className="nav-active-mark" /> : null}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-help"><CircleHelp size={16} /><span>Mission guide</span><ArrowUpRight size={13} /></div>
          <div className="sidebar-user"><div className="user-avatar">MC</div><div className="user-meta"><strong>Flight Director</strong><span>MISSION OPERATIONS</span></div><Settings2 size={16} /></div>
        </div>
      </aside>

      <div className="mc-main">
        <header className="mc-topbar">
          <div className="topbar-left">
            <button className="mobile-menu-button" type="button" aria-label="Toggle navigation" onClick={() => setMobileNavOpen((open) => !open)}><Menu size={19} /></button>
            <div className="breadcrumb"><span>MISSIONCRAFT</span><ChevronRight size={13} /><strong>{title[0]}</strong></div>
          </div>
          <div className="topbar-right">
            <div className={`connection-state ${isEngineConnected ? "is-connected" : "is-preview"}`}><span className="live-dot" /> ENGINE LINK <strong>{isEngineConnected ? "CONNECTED" : "PREVIEW"}</strong></div>
            <span className="topbar-divider" />
            <div className="topbar-mission-id"><span>ACTIVE MISSION</span><strong>{selectedMission.code.split("/")[0].trim()}</strong></div>
            <div className="topbar-avatar">FD</div>
          </div>
        </header>

        <main className="mc-content">
          <div className="page-title-row">
            <div><div className="page-kicker"><span className="kicker-line" /> {title[0]}</div><h1>{title[1]}</h1></div>
            <div className="page-title-status"><span className="status-label">CURRENT STATUS</span><span className="status-pill"><span className="status-dot" /> {missionStatus}</span></div>
          </div>

          {notification ? <div className="mc-notification" role="status"><CheckCircle2 size={15} /> {notification}<button type="button" aria-label="Dismiss notification" onClick={() => setNotification("")}>×</button></div> : null}

          {currentView === "overview" ? (
            <>
              <section className="overview-hero">
                <div className="overview-hero-copy">
                  <div className="hero-overline"><Sparkles size={13} /> THE NEXT FRONTIER IS YOURS</div>
                  <h2>Every great journey<br />begins with a <em>plan.</em></h2>
                  <p>Design your spacecraft. Master your resources. Take command of a mission beyond Earth.</p>
                  <div className="hero-actions"><button type="button" className="mc-button mc-button-primary" onClick={() => navigate("missions")}>EXPLORE MISSIONS <ArrowRight size={15} /></button><button type="button" className="mc-button mc-button-ghost" onClick={() => navigate("designer")}>OPEN DESIGNER <SlidersHorizontal size={15} /></button></div>
                  <div className="hero-footnote"><span><ShieldCheck size={14} /> BUILT FOR MISSION THINKING</span><span><LockKeyhole size={13} /> YOUR FLIGHT. YOUR DECISIONS.</span></div>
                </div>
                <div className="overview-visual">
                  <div className="visual-coordinate coordinate-top">N 28° 36′ 36.0″<br />E 77° 12′ 36.0″</div>
                  <div className="hero-planet-glow" />
                  <div className="hero-planet-ring ring-back" />
                  <div className="hero-planet"><div className="hero-planet-shadow" /><div className="hero-planet-crater crater-one" /><div className="hero-planet-crater crater-two" /><div className="hero-planet-crater crater-three" /></div>
                  <div className="hero-planet-ring ring-front" />
                  <div className="hero-satellite"><Satellite size={24} /></div>
                  <div className="visual-coordinate coordinate-bottom">FIG 01 / DEEP SPACE<br />MISSION ENVIRONMENT</div>
                  <div className="visual-crosshair crosshair-a" /><div className="visual-crosshair crosshair-b" />
                </div>
              </section>

              <section className="overview-section">
                <SectionHeading eyebrow="CHOOSE YOUR OBJECTIVE" title="Missions ready for launch" description="Select an expedition to review its objectives and begin vehicle configuration." action={<button className="text-action" type="button" onClick={() => navigate("missions")}>VIEW ALL MISSIONS <ArrowRight size={14} /></button>} />
                <div className="mission-grid">
                  {missions.map((mission) => <MissionCard key={mission.id} mission={mission} selected={selectedMission.id === mission.id} onSelect={chooseMission} />)}
                </div>
              </section>

              <section className="overview-bottom-grid">
                <div className="panel resource-snapshot-panel">
                  <div className="panel-heading"><div><span className="panel-eyebrow">FLIGHT SYSTEMS</span><h3>Resource snapshot</h3></div><button type="button" className="icon-button" aria-label="Open resources" onClick={() => navigate("resources")}><ArrowUpRight size={16} /></button></div>
                  <div className="snapshot-resources">{resourceEntries.map(([id, data]) => <ResourceCard key={id} id={id} data={data} />)}</div>
                </div>
                <div className="panel mission-brief-panel">
                  <div className="panel-heading"><div><span className="panel-eyebrow">ACTIVE FLIGHT PLAN</span><h3>{selectedMission.name}</h3></div><span className="mission-brief-status">{selectedMission.difficulty}</span></div>
                  <p>{selectedMission.description}</p>
                  <div className="brief-details"><div><span>DESTINATION</span><strong>{selectedMission.destination}</strong></div><div><span>PLANNED DURATION</span><strong>{selectedMission.duration}</strong></div></div>
                  <button type="button" className="panel-link" onClick={() => navigate("readiness")}>REVIEW LAUNCH READINESS <ArrowRight size={14} /></button>
                </div>
              </section>
            </>
          ) : null}

          {currentView === "missions" ? (
            <section className="page-section">
              <SectionHeading eyebrow="MISSION CATALOGUE / 03 AVAILABLE" title="Where will you go?" description="Each destination presents a different flight profile, operational challenge, and set of mission objectives." />
              <div className="mission-grid mission-grid-large">{missions.map((mission) => <MissionCard key={mission.id} mission={mission} selected={selectedMission.id === mission.id} onSelect={chooseMission} />)}</div>
              <div className="selected-mission-bar"><div className="selected-mission-indicator"><span className="live-dot" /><div><span>SELECTED FLIGHT PLAN</span><strong>{selectedMission.name}</strong></div></div><button type="button" className="mc-button mc-button-primary" onClick={() => navigate("designer")}>CONFIGURE SPACECRAFT <ArrowRight size={15} /></button></div>
            </section>
          ) : null}

          {currentView === "designer" ? (
            <section className="page-section">
              <div className="designer-intro"><div><div className="section-eyebrow">VEHICLE ASSEMBLY / {selectedMission.code}</div><h2>Engineer your way forward.</h2><p>Configure mission hardware. Changes are sent to the game engine through the spacecraft callback.</p></div><div className="designer-tag"><Cpu size={16} /> CONFIGURATION MODE</div></div>
              <div className="designer-layout">
                <div className="panel component-panel"><div className="panel-heading"><div><span className="panel-eyebrow">VEHICLE SYSTEMS</span><h3>Equipment manifest</h3></div><span className="manifest-count">{parts.filter((part) => part.installed).length.toString().padStart(2, "0")} / {parts.length.toString().padStart(2, "0")}</span></div>
                  <div className="component-list">{parts.map((part, index) => { const Icon = typeof part.icon === "function" ? part.icon : Cpu; return <div className={`component-row ${part.installed ? "installed" : ""}`} key={part.id}><div className="component-index">0{index + 1}</div><div className="component-icon"><Icon size={18} /></div><div className="component-info"><span>{part.group || "SPACECRAFT SYSTEM"}</span><strong>{part.name}</strong><small>{part.spec}</small></div><div className="component-control"><span>{part.mass || "—"}</span><button type="button" className={`toggle-switch ${part.installed ? "on" : ""}`} aria-label={`${part.installed ? "Remove" : "Install"} ${part.name}`} aria-pressed={part.installed} onClick={() => togglePart(part)}><i /></button></div></div>; })}</div>
                  <div className="component-panel-note"><TriangleAlert size={14} /><span>Vehicle performance and derived totals are calculated by the mission engine.</span></div>
                </div>
                <div className="designer-preview-column"><SpacecraftPreview selectedParts={selectedParts} /><div className="panel design-summary"><div><span>ACTIVE MISSION</span><strong>{selectedMission.name}</strong></div><div><span>VEHICLE CLASS</span><strong>ORBITAL EXPLORER</strong></div><button type="button" className="mc-button mc-button-primary" onClick={() => navigate("resources")}>REVIEW RESOURCES <ArrowRight size={15} /></button></div></div>
              </div>
            </section>
          ) : null}

          {currentView === "resources" ? (
            <section className="page-section">
              <SectionHeading eyebrow="SYSTEMS / RESOURCE ALLOCATION" title="Every kilogram counts." description="Monitor the resource figures supplied by the mission engine. The interface does not calculate mission costs, mass, fuel, or power." action={<span className="data-source-pill"><Activity size={13} /> {isEngineConnected ? "ENGINE DATA" : "PREVIEW DATA"}</span>} />
              <div className="resource-dashboard-grid">{resourceEntries.map(([id, data]) => <ResourceCard key={id} id={id} data={data} />)}</div>
              <div className="resource-detail-layout"><div className="panel allocation-panel"><div className="panel-heading"><div><span className="panel-eyebrow">ALLOCATION MONITOR</span><h3>Resource telemetry</h3></div><span className="data-live-label"><span className="live-dot" /> LIVE SNAPSHOT</span></div><div className="allocation-rows">{resourceEntries.map(([id, data]) => <div className="allocation-row" key={id}><div className="allocation-label"><span>{id.toUpperCase()}</span><strong>{data?.display ?? "—"}</strong></div><div className="allocation-track"><span className={`tone-fill-${data?.tone || "blue"}`} style={{ width: `${clampPercent(data?.percent)}%` }} /></div><span className="allocation-value">{clampPercent(data?.percent)}%</span></div>)}</div></div>
                <div className="panel resource-advisory"><div className="advisory-icon"><LifeBuoy size={19} /></div><span className="panel-eyebrow">FLIGHT DIRECTOR NOTE</span><h3>Plan for the unexpected.</h3><p>Maintain operational reserves for contingencies. Review the mission engine's resource assessment before requesting launch.</p><button type="button" className="panel-link" onClick={() => navigate("readiness")}>OPEN READINESS REVIEW <ArrowRight size={14} /></button></div></div>
              <div className="resource-actions"><span><LockKeyhole size={14} /> Values are read-only in this interface.</span><button type="button" className="mc-button mc-button-secondary" onClick={() => onResourceAction({ action: "refresh" })}><RefreshCw size={14} /> REQUEST DATA REFRESH</button></div>
            </section>
          ) : null}

          {currentView === "readiness" ? (
            <section className="page-section">
              <div className="readiness-banner"><div className="readiness-banner-icon"><ShieldCheck size={24} /></div><div className="readiness-banner-copy"><span>PRE-LAUNCH VERIFICATION</span><h2>Ready when you are.</h2><p>Review the mission checks before submitting a launch request. Readiness decisions remain owned by the mission engine.</p></div><div className="readiness-score"><strong>{readinessPercent}%</strong><span>CHECKS COMPLETE</span></div></div>
              <div className="readiness-layout"><div className="panel checklist-panel"><div className="panel-heading"><div><span className="panel-eyebrow">FLIGHT CHECKLIST</span><h3>Launch authorization checks</h3></div><span className="checklist-count">{completeCount}/{readinessItems.length} COMPLETE</span></div><div className="checklist-items">{readinessItems.map((item, index) => { const complete = Boolean(item.complete ?? item.completed); return <div className={`checklist-item ${complete ? "checked" : "pending"}`} key={item.id}><div className="checklist-number">{String(index + 1).padStart(2, "0")}</div><div className={`checklist-icon ${complete ? "" : "pending-icon"}`}>{complete ? <Check size={16} /> : <Clock3 size={16} />}</div><div className="checklist-copy"><strong>{item.title}</strong><span>{item.detail}</span></div><div className={`checklist-state ${complete ? "complete" : "awaiting"}`}>{complete ? "VERIFIED" : "AWAITING"}</div><button type="button" className="checklist-review" onClick={() => handleReadiness(item)} aria-label={`Request status change for ${item.title}`}><ArrowUpRight size={15} /></button></div>; })}</div><div className="checklist-footnote"><CircleHelp size={14} /><span>Use the review action to send a checklist update request to the mission engine.</span></div></div>
                <div className="panel launch-authorization"><div className="authorization-orbit"><Rocket size={24} /></div><span className="panel-eyebrow">LAUNCH AUTHORIZATION</span><h3>Flight plan submission</h3><p>Submit the current mission configuration to the game engine for final validation.</p><div className="authorization-status"><span>ENGINE STATUS</span><strong><span className="live-dot" /> {missionStatus}</strong></div><button type="button" className="mc-button mc-button-primary launch-request-button" onClick={requestLaunch}>REQUEST LAUNCH REVIEW <ArrowRight size={15} /></button><small>Submission does not bypass engine validation.</small></div></div>
            </section>
          ) : null}

          {currentView === "control" ? (
            <section className="page-section">
              <div className="control-heading-row"><div><div className="section-eyebrow">FLIGHT TELEMETRY / {selectedMission.code}</div><h2>Mission operations feed</h2><p>Live mission state and controls are provided by the simulation engine.</p></div><div className="control-live-pill"><span className="live-dot" /> {isEngineConnected ? (simulationRunning ? "SIMULATION RUNNING" : "SIMULATION STANDBY") : "PREVIEW MODE"}</div></div>
              <div className="mission-control-layout"><div className="simulation-window"><div className="simulation-window-top"><span><span className="live-dot" /> SIMULATION VIEWPORT</span><span>CAM 01 / EXTERNAL</span></div><div className={`simulation-scene ${simulationViewport ? "has-engine-viewport" : "is-preview-viewport"}`}>{simulationViewport ? <div className="simulation-viewport-slot">{simulationViewport}</div> : <><div className="scene-stars" /><div className="scene-planet" /><div className="scene-planet-halo" /><div className="scene-spacecraft"><div className="scene-craft-wing left" /><div className="scene-craft-core" /><div className="scene-craft-wing right" /><div className="scene-craft-flame" /></div><div className="scene-crosshair" /><div className="scene-coordinates">UI PREVIEW / NO LIVE COORDINATES</div><div className="scene-object-label">TARGET BODY // {selectedMission.destination.toUpperCase()}</div><div className="scene-preview-label">2D PREVIEW · CONNECT MEMBER 3 VIEWPORT</div></>}</div><div className="simulation-window-bottom"><span><span className="status-dot" /> {simulationViewport ? "RENDER STATUS: ENGINE VIEW" : "RENDER STATUS: PREVIEW ONLY"}</span><span>FRAME 060 / 060</span></div></div>
                <div className="panel telemetry-panel"><div className="panel-heading"><div><span className="panel-eyebrow">{isEngineConnected ? "FLIGHT DATA SYSTEM" : "TELEMETRY PREVIEW"}</span><h3>Telemetry</h3></div><Activity size={17} className="telemetry-icon" /></div><div className="telemetry-grid">{telemetry.map((item) => <div className="telemetry-cell" key={item.label}><span>{item.label}</span><strong>{item.value} <small>{item.unit}</small></strong></div>)}</div><div className="telemetry-divider" /><div className="telemetry-mission-row"><span>MISSION</span><strong>{selectedMission.name}</strong></div><div className="telemetry-mission-row"><span>STATUS</span><strong>{missionStatus}</strong></div><div className="telemetry-mission-row"><span>DATA LINK</span><strong className={isEngineConnected ? "online-text" : ""}>{isEngineConnected ? "CONNECTED" : "NOT CONNECTED"}</strong></div><div className="simulation-controls"><button type="button" className="mc-button mc-button-secondary" onClick={() => handleSimulation(simulationRunning ? "pause" : "resume")}>{simulationRunning ? <Pause size={14} /> : <Play size={14} />}{simulationRunning ? "PAUSE" : "RESUME"}</button><button type="button" className="icon-button" aria-label="Reset simulation" onClick={() => handleSimulation("reset")}><RefreshCw size={16} /></button></div></div></div>
            </section>
          ) : null}

          {currentView === "results" ? (
            <section className="page-section">
              <SectionHeading eyebrow="MISSION DEBRIEF / ARCHIVE" title="The mission doesn't end at landing." description="Review completed mission outcomes and compare archived flight records." />
              {results ? <div className="panel result-summary-panel"><div><span className="panel-eyebrow">LATEST MISSION RESULT</span><h3>{results.title || selectedMission.name}</h3><p>{results.summary || "Mission result received from the game engine."}</p></div><div className="result-score"><strong>{results.score ?? "—"}</strong><span>MISSION SCORE</span></div></div> : <EmptyState icon={Telescope} title="No completed missions yet" description="Your mission score, scientific outcomes, and debrief will appear here after the game engine returns a completed mission result." action={<button type="button" className="mc-button mc-button-primary" onClick={() => navigate("missions")}>SELECT A MISSION <ArrowRight size={15} /></button>} />}
              <div className="history-section"><div className="panel-heading"><div><span className="panel-eyebrow">FLIGHT RECORDS</span><h3>Mission history</h3></div><span className="history-count">{history.length.toString().padStart(2, "0")} RECORDS</span></div>{history.length ? <div className="history-table-wrap"><table className="history-table"><thead><tr><th>MISSION</th><th>DESTINATION</th><th>DATE</th><th>STATUS</th><th>SCORE</th></tr></thead><tbody>{history.map((item, index) => <tr key={item.id || `${item.name}-${index}`}><td><strong>{item.name || item.title || "Unnamed mission"}</strong></td><td>{item.destination || "—"}</td><td>{item.date || "—"}</td><td><span className="history-status">{item.status || "COMPLETED"}</span></td><td>{item.score ?? "—"}</td></tr>)}</tbody></table></div> : <div className="history-empty"><History size={17} /><span>Mission records will be added here after completion.</span></div>}</div>
            </section>
          ) : null}

          <footer className="mc-footer"><span>MISSIONCRAFT <b>·</b> DESIGN. LAUNCH. MANAGE. EXPLORE.</span><span><span className="live-dot" /> SYSTEMS OPERATIONAL</span><span>FRONTEND MODULE / MEMBER 01</span></footer>
        </main>
      </div>
    </div>
  );
}

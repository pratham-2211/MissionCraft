import { useState, useEffect } from "react";
import {
  Orbit,
  Menu,
  X,
  Volume2,
  VolumeX,
  Sliders,
  CheckCircle2,
} from "lucide-react";

export default function Header({ currentScreen, onNavigate, activeMission, isEngineReady = true }) {
  const [utcTime, setUtcTime] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const h = String(now.getUTCHours()).padStart(2, "0");
      const m = String(now.getUTCMinutes()).padStart(2, "0");
      const s = String(now.getUTCSeconds()).padStart(2, "0");
      const ms = String(Math.floor(now.getUTCMilliseconds() / 100));
      setUtcTime(`${h}:${m}:${s}.${ms}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 100);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: "command-center", label: "Command Center" },
    { id: "missions", label: "Missions" },
    { id: "designer", label: "Spacecraft Designer" },
    { id: "resources", label: "Resource Management" },
    { id: "readiness", label: "Launch Readiness" },
    { id: "mission-control", label: "Mission Control" },
    { id: "history", label: "History" },
  ];

  const handleNavClick = (id) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="stitch-header">
      <div className="stitch-header-inner">
        {/* Left: Brand Lockup & Engine Status */}
        <div className="stitch-header-left">
          <button
            type="button"
            className="stitch-brand-btn"
            onClick={() => handleNavClick("command-center")}
          >
            <div className="stitch-brand-icon">
              <Orbit size={20} strokeWidth={2.2} />
            </div>
            <span className="stitch-brand-text">MissionCraft</span>
          </button>

          <div className="stitch-badges-group">
            <span className="stitch-badge-spaceapps">NASA SPACE APPS 2026</span>
            <div className="stitch-engine-status">
              <span className="stitch-pulse-dot" />
              <span className="stitch-engine-text">
                {isEngineReady ? "SIM ENGINE: READY" : "ENGINE: STANDBY"}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Desktop Navigation Bar */}
        <nav className="stitch-nav-bar" aria-label="Main Navigation">
          {navItems.map((item) => {
            const isActive = currentScreen === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={`stitch-nav-link ${isActive ? "is-active" : ""}`}
                onClick={() => handleNavClick(item.id)}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right: Telemetry Time, Comms Link, Controls & User */}
        <div className="stitch-header-right">
          <div className="stitch-telemetry-capsule">
            <div className="stitch-capsule-col">
              <span className="stitch-capsule-label">UTC TIME</span>
              <span className="stitch-capsule-val font-tnum">{utcTime || "14:28:09.4"}</span>
            </div>
            <div className="stitch-capsule-divider" />
            <div className="stitch-capsule-col">
              <span className="stitch-capsule-label">COMMS LINK</span>
              <div className="stitch-capsule-row">
                <span className="stitch-comms-dot" />
                <span className="stitch-capsule-cyan font-tnum">99.8%</span>
              </div>
            </div>
          </div>

          <div className="stitch-controls-group">
            <button
              type="button"
              className="stitch-icon-btn"
              title={soundEnabled ? "Audio Feed Online" : "Audio Muted"}
              onClick={() => setSoundEnabled(!soundEnabled)}
            >
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
            <button
              type="button"
              className="stitch-icon-btn"
              title="Avionics Console Tuning"
              onClick={() => handleNavClick("resources")}
            >
              <Sliders size={16} />
            </button>
          </div>

          {/* User Flight Director Avatar */}
          <div className="stitch-avatar" title="Flight Director">
            <span>FD</span>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            className="stitch-mobile-toggle"
            aria-label="Toggle navigation menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen ? (
        <div className="stitch-mobile-drawer">
          <div className="stitch-drawer-header">
            <span className="stitch-drawer-kicker">FLIGHT LIFECYCLE SECTIONS</span>
            {activeMission ? (
              <span className="stitch-drawer-mission">
                TARGET: <strong>{activeMission.name}</strong>
              </span>
            ) : null}
          </div>
          <div className="stitch-drawer-links">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`stitch-drawer-link ${currentScreen === item.id ? "is-active" : ""}`}
                onClick={() => handleNavClick(item.id)}
              >
                <span>{item.label}</span>
                {currentScreen === item.id ? <CheckCircle2 size={16} className="text-secondary" /> : null}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </header>
  );
}

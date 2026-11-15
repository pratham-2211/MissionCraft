import { Orbit, ShieldCheck } from "lucide-react";

export default function Footer({ onNavigate }) {
  return (
    <footer className="stitch-footer">
      <div className="stitch-footer-inner">
        <div className="stitch-footer-brand">
          <div className="stitch-footer-logo">
            <Orbit size={18} />
          </div>
          <div className="stitch-footer-title">
            <strong>MISSIONCRAFT</strong>
            <span>AEROSPACE MISSION CONTROL & SIMULATION ENGINE</span>
          </div>
        </div>

        <div className="stitch-footer-links">
          <button type="button" onClick={() => onNavigate("command-center")}>
            COMMAND CENTER
          </button>
          <button type="button" onClick={() => onNavigate("missions")}>
            MISSIONS
          </button>
          <button type="button" onClick={() => onNavigate("designer")}>
            SPACECRAFT DESIGNER
          </button>
          <button type="button" onClick={() => onNavigate("resources")}>
            RESOURCE AUDIT
          </button>
          <button type="button" onClick={() => onNavigate("readiness")}>
            LAUNCH READINESS
          </button>
          <button type="button" onClick={() => onNavigate("history")}>
            ARCHIVE
          </button>
        </div>

        <div className="stitch-footer-meta">
          <div className="stitch-footer-status">
            <span className="stitch-pulse-dot" />
            <span>SYSTEMS NOMINAL // NASA SPACE APPS 2026</span>
          </div>
          <div className="stitch-footer-rights">
            <ShieldCheck size={13} />
            <span>WCAG AAA COMPLIANT AVIONICS UI</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

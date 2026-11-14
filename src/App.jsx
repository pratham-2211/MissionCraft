
import { useState } from "react";
import { Rocket, Orbit, Settings, ChevronRight } from "lucide-react";
import "./index.css";

const missions = [
  { name: "Lunar Expedition", destination: "Moon", icon: "🌕", level: "Beginner" },
  { name: "Mars Exploration", destination: "Mars", icon: "🔴", level: "Advanced" },
  { name: "Earth Observation", destination: "Earth", icon: "🌍", level: "Intermediate" }
];

export default function App() {
  const [selected, setSelected] = useState(0);

  return (
    <div className="app">
      <nav className="navbar">
        <div className="brand"><Orbit /> MISSION<span>CRAFT</span></div>
        <div className="nav-links">COMMAND CENTER　 MISSIONS　 DATABASE</div>
        <Settings />
      </nav>

      <main>
        <section className="hero">
          <div>
            <div className="eyebrow">● SPACE EXPLORATION SIMULATOR</div>
            <h1>YOUR MISSION.<br /><span>YOUR UNIVERSE.</span></h1>
            <p>Design spacecraft, manage resources and explore the unknown. Your journey into space begins here.</p>
            <button className="primary" onClick={() => alert("Mission initialized!")}>
              <Rocket size={18} /> START YOUR MISSION <ChevronRight size={18} />
            </button>
          </div>

          <div className="planet">
            <div className="planet-sphere"></div>
            <div className="orbit"></div>
          </div>
        </section>

        <section className="missions">
          <div className="eyebrow">MISSION CONTROL</div>
          <h2>Select your destination</h2>

          <div className="mission-grid">
            {missions.map((mission, index) => (
              <button
                key={mission.name}
                className={`mission-card ${selected === index ? "active" : ""}`}
                onClick={() => setSelected(index)}
              >
                <div className="mission-icon">{mission.icon}</div>
                <small>{mission.level}</small>
                <h3>{mission.name}</h3>
                <p>Destination: {mission.destination}</p>
                <div className="card-footer">SELECT MISSION →</div>
              </button>
            ))}
          </div>

          <div className="launch-panel">
            <div>
              <small>SELECTED MISSION</small>
              <h3>{missions[selected].name}</h3>
            </div>
            <button className="primary" onClick={() => alert("Mission preparation started!")}>
              <Rocket size={18} /> INITIALIZE MISSION
            </button>
          </div>
        </section>
      </main>
      <footer>MISSIONCRAFT © 2026 <span>DESIGNED FOR SPACE EXPLORATION</span></footer>
    </div>
  );
}

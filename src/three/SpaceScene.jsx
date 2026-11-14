import React, { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Stars,
  OrbitControls,
  useTexture,
  Float,
  Line,
} from "@react-three/drei";
import * as THREE from "three";

const EARTH_RADIUS = 2.05;

function Moon({ focused = false }) {
  const moonRef = useRef();
  const moonMap = useTexture("/textures/moon.jpg");

  useEffect(() => {
    moonMap.colorSpace = THREE.SRGBColorSpace;
    moonMap.anisotropy = 12;
  }, [moonMap]);

  useFrame((_, delta) => {
    if (moonRef.current) moonRef.current.rotation.y += delta * 0.012;
  });

  return (
    <group ref={moonRef} position={focused ? [0, 0, 0] : [-6.15, 1.05, -2.6]} scale={focused ? 3.5 : 1}>
      <mesh>
        <sphereGeometry args={[0.58, 72, 72]} />
        <meshStandardMaterial map={moonMap} roughness={1} metalness={0} />
      </mesh>
      <mesh scale={1.045}>
        <sphereGeometry args={[0.58, 48, 48]} />
        <meshBasicMaterial
          color="#9eb8d2"
          transparent
          opacity={0.035}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

function LunarReferenceOrbit() {
  const points = useMemo(() => {
    const result = [];
    for (let i = 0; i <= 220; i++) {
      const t = (i / 220) * Math.PI * 2;
      result.push([
        Math.cos(t) * 6.15,
        1.05 + Math.sin(t) * 0.42,
        -2.6 + Math.sin(t) * 2.6,
      ]);
    }
    return result;
  }, []);

  return (
    <Line
      points={points}
      color="#718da9"
      transparent
      opacity={0.16}
      lineWidth={1}
      dashed
      dashSize={0.12}
      gapSize={0.12}
    />
  );
}

function Earth() {
  const earthRef = useRef();
  const cloudRef = useRef();

  const [colorMap, normalMap, cloudMap, nightMap] = useTexture([
    "/textures/earth.jpg",
    "/textures/earth_normal.jpg",
    "/textures/earth_clouds.png",
    "/textures/earth_lights.png",
  ]);

  useEffect(() => {
    colorMap.colorSpace = THREE.SRGBColorSpace;
    cloudMap.colorSpace = THREE.SRGBColorSpace;
    nightMap.colorSpace = THREE.SRGBColorSpace;

    [colorMap, normalMap, cloudMap, nightMap].forEach((texture) => {
      texture.anisotropy = 12;
    });
  }, [colorMap, normalMap, cloudMap, nightMap]);

  useFrame((_, delta) => {
    if (earthRef.current) earthRef.current.rotation.y += delta * 0.018;
    if (cloudRef.current) cloudRef.current.rotation.y += delta * 0.023;
  });

  return (
    <group>
      <mesh ref={earthRef}>
        <sphereGeometry args={[EARTH_RADIUS, 128, 128]} />
        <meshStandardMaterial
          map={colorMap}
          normalMap={normalMap}
          normalScale={new THREE.Vector2(0.42, 0.42)}
          roughness={0.94}
          metalness={0}
          emissiveMap={nightMap}
          emissive={new THREE.Color("#ffffff")}
          emissiveIntensity={0.22}
        />
      </mesh>

      <mesh ref={cloudRef} scale={1.006}>
        <sphereGeometry args={[EARTH_RADIUS, 128, 128]} />
        <meshStandardMaterial
          map={cloudMap}
          transparent
          opacity={0.31}
          roughness={1}
          depthWrite={false}
        />
      </mesh>

      {/* Thin atmospheric rim */}
      <mesh scale={1.035}>
        <sphereGeometry args={[EARTH_RADIUS, 96, 96]} />
        <meshBasicMaterial
          color="#4aaeff"
          transparent
          opacity={0.16}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <mesh scale={1.085}>
        <sphereGeometry args={[EARTH_RADIUS, 96, 96]} />
        <meshBasicMaterial
          color="#176bd6"
          transparent
          opacity={0.055}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

function Mars() {
  const marsRef = useRef();
  const marsMap = useTexture("/textures/mars.jpg");

  useEffect(() => {
    marsMap.colorSpace = THREE.SRGBColorSpace;
    marsMap.anisotropy = 12;
  }, [marsMap]);

  useFrame((_, delta) => {
    if (marsRef.current) marsRef.current.rotation.y += delta * 0.012;
  });

  return (
    <group>
      <mesh ref={marsRef}>
        <sphereGeometry args={[2.05, 128, 128]} />
        <meshStandardMaterial map={marsMap} roughness={0.96} metalness={0} />
      </mesh>
      {/* Thin dusty atmospheric limb */}
      <mesh scale={1.035}>
        <sphereGeometry args={[2.05, 96, 96]} />
        <meshBasicMaterial
          color="#e87545"
          transparent
          opacity={0.13}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh scale={1.075}>
        <sphereGeometry args={[2.05, 96, 96]} />
        <meshBasicMaterial
          color="#9d3c25"
          transparent
          opacity={0.045}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

function SolarPanel({ position, side = 1 }) {
  return (
    <group position={position}>
      {/* Panel frame */}
      <mesh>
        <boxGeometry args={[1.12, 0.72, 0.035]} />
        <meshStandardMaterial
          color="#a9c4df"
          metalness={0.82}
          roughness={0.3}
        />
      </mesh>

      {/* Blue photovoltaic surface */}
      <mesh position={[0, 0, 0.022]}>
        <boxGeometry args={[1.075, 0.675, 0.012]} />
        <meshStandardMaterial
          color="#102d59"
          metalness={0.48}
          roughness={0.34}
          emissive="#071a38"
          emissiveIntensity={0.25}
        />
      </mesh>

      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={`v-${i}`} position={[-0.45 + i * 0.18, 0, 0.032]}>
          <boxGeometry args={[0.009, 0.65, 0.006]} />
          <meshBasicMaterial color="#8ed4ff" />
        </mesh>
      ))}

      {Array.from({ length: 4 }).map((_, i) => (
        <mesh key={`h-${i}`} position={[0, -0.27 + i * 0.18, 0.033]}>
          <boxGeometry args={[1.06, 0.009, 0.006]} />
          <meshBasicMaterial color="#8ed4ff" />
        </mesh>
      ))}

      {/* Hinge and support */}
      <mesh position={[-side * 0.59, 0, 0]}>
        <cylinderGeometry args={[0.035, 0.035, 0.16, 10]} />
        <meshStandardMaterial color="#d2dce7" metalness={0.9} />
      </mesh>
    </group>
  );
}

function Satellite() {
  return (
    <group scale={0.49} rotation={[0.12, 0, -0.1]}>
      {/* Main spacecraft bus */}
      <mesh>
        <boxGeometry args={[0.62, 0.82, 0.58]} />
        <meshStandardMaterial
          color="#aebbc9"
          metalness={0.72}
          roughness={0.34}
        />
      </mesh>

      {/* Gold multilayer insulation panels */}
      {[-0.29, 0.29].map((x) => (
        <mesh key={x} position={[x, 0, 0]}>
          <boxGeometry args={[0.035, 0.76, 0.55]} />
          <meshStandardMaterial
            color="#c9953d"
            metalness={0.58}
            roughness={0.42}
          />
        </mesh>
      ))}

      {/* Equipment deck */}
      <mesh position={[0, 0.44, 0]}>
        <boxGeometry args={[0.58, 0.09, 0.54]} />
        <meshStandardMaterial color="#d8e0e8" metalness={0.8} />
      </mesh>

      {/* Structural corner rails */}
      {[-1, 1].map((x) =>
        [-1, 1].map((z) => (
          <mesh key={`${x}-${z}`} position={[x * 0.29, 0, z * 0.25]}>
            <boxGeometry args={[0.035, 0.88, 0.035]} />
            <meshStandardMaterial color="#e0e7ef" metalness={0.9} />
          </mesh>
        ))
      )}

      {/* Radiator panel */}
      <mesh position={[0, -0.05, 0.31]}>
        <boxGeometry args={[0.34, 0.42, 0.035]} />
        <meshStandardMaterial color="#283b51" metalness={0.75} roughness={0.3} />
      </mesh>

      {/* Camera / optical instrument */}
      <group position={[0.08, -0.12, 0.39]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.13, 0.13, 0.2, 24]} />
          <meshStandardMaterial color="#26364a" metalness={0.8} />
        </mesh>
        <mesh position={[0, 0, 0.11]}>
          <circleGeometry args={[0.092, 32]} />
          <meshPhysicalMaterial
            color="#071b36"
            metalness={0.4}
            roughness={0.12}
            clearcoat={1}
            emissive="#0879ca"
            emissiveIntensity={0.65}
          />
        </mesh>
      </group>

      {/* Solar array booms */}
      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh position={[side * 0.49, 0, 0]}>
            <cylinderGeometry args={[0.025, 0.025, 0.7, 10]} />
            <meshStandardMaterial color="#c4d1df" metalness={0.9} />
          </mesh>
          <SolarPanel position={[side * 1.1, 0, 0]} side={side} />
        </group>
      ))}

      {/* High-gain antenna mast */}
      <mesh position={[0, 0.77, -0.04]}>
        <cylinderGeometry args={[0.018, 0.018, 0.58, 10]} />
        <meshStandardMaterial color="#dce4ed" metalness={0.9} />
      </mesh>

      {/* Dish reflector */}
      <group position={[0, 1.08, -0.04]} rotation={[0.28, 0, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <sphereGeometry
            args={[0.27, 40, 24, 0, Math.PI * 2, 0, Math.PI / 2]}
          />
          <meshStandardMaterial
            color="#dce5ee"
            metalness={0.92}
            roughness={0.2}
            side={THREE.DoubleSide}
          />
        </mesh>
        <mesh position={[0, 0, 0.13]}>
          <sphereGeometry args={[0.035, 16, 16]} />
          <meshStandardMaterial color="#e4b75e" metalness={0.8} />
        </mesh>
      </group>

      {/* Attitude-control thrusters */}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 0.34, -0.39, 0.2]} rotation={[0, 0, side * 0.4]}>
          <cylinderGeometry args={[0.045, 0.065, 0.16, 12]} />
          <meshStandardMaterial color="#65788d" metalness={0.9} />
        </mesh>
      ))}

      {/* Main engine bell */}
      <mesh position={[0, -0.53, 0]} rotation={[Math.PI, 0, 0]}>
        <cylinderGeometry args={[0.11, 0.19, 0.28, 24, 1, true]} />
        <meshStandardMaterial
          color="#53677c"
          metalness={0.94}
          roughness={0.24}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Very subtle engine plume */}
      <mesh position={[0, -0.76, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.105, 0.36, 24]} />
        <meshBasicMaterial
          color="#47bfff"
          transparent
          opacity={0.12}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <pointLight position={[0.34, 0.12, 0.25]} color="#4dbbff" intensity={0.6} distance={1.5} />
      <pointLight position={[-0.34, 0.12, 0.25]} color="#ff6b58" intensity={0.6} distance={1.5} />
    </group>
  );
}

function OrbitalSystem({ orbitColor = "#4b9bd6" }) {
  const satelliteRef = useRef();

  const orbitPoints = useMemo(() => {
    const points = [];
    const a = 3.18;
    const b = 2.72;

    for (let i = 0; i <= 240; i++) {
      const t = (i / 240) * Math.PI * 2;
      points.push([
        Math.cos(t) * a,
        Math.sin(t) * 0.32,
        Math.sin(t) * b,
      ]);
    }
    return points;
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime * 0.16;
    if (!satelliteRef.current) return;

    satelliteRef.current.position.set(
      Math.cos(t) * 3.18,
      Math.sin(t) * 0.32,
      Math.sin(t) * 2.72
    );

    satelliteRef.current.rotation.y = -t + Math.PI / 2;
  });

  return (
    <>
      <Line
        points={orbitPoints}
        color={orbitColor}
        transparent
        opacity={0.42}
        lineWidth={1}
      />

      {/* Small orbital reference markers */}
      {[0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2].map((angle, index) => (
        <mesh
          key={index}
          position={[
            Math.cos(angle) * 3.18,
            Math.sin(angle) * 0.32,
            Math.sin(angle) * 2.72,
          ]}
        >
          <sphereGeometry args={[0.025, 12, 12]} />
          <meshBasicMaterial color="#80cfff" />
        </mesh>
      ))}

      <group ref={satelliteRef}>
        <Float speed={0.8} rotationIntensity={0.025} floatIntensity={0.025}>
          <Satellite />
        </Float>
      </group>
    </>
  );
}


function NasaMarsDataPanel() {
  const [rover, setRover] = useState("Perseverance");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadNasaImages() {
      setLoading(true);
      setError("");
      setItems([]);

      const query = `${rover} rover Mars`;
      const endpoint = `https://images-api.nasa.gov/search?q=${encodeURIComponent(query)}&media_type=image&page_size=12`;

      try {
        const response = await fetch(endpoint, { signal: controller.signal });
        if (!response.ok) throw new Error(`NASA API returned HTTP ${response.status}`);

        const payload = await response.json();
        const results = (payload.collection?.items || [])
          .map((item) => {
            const metadata = item.data?.[0] || {};
            const preview = item.links?.find((link) => link.rel === "preview")?.href
              || item.links?.[0]?.href;

            return {
              id: metadata.nasa_id || "",
              title: metadata.title || "Untitled NASA image",
              date: metadata.date_created
                ? new Date(metadata.date_created).toLocaleDateString("en-US", {
                    year: "numeric", month: "short", day: "numeric"
                  })
                : "Date unavailable",
              center: metadata.center || "NASA",
              photographer: metadata.photographer || "Not credited",
              location: metadata.location || "Location unavailable",
              keywords: metadata.keywords || [],
              mediaType: metadata.media_type || "image",
              image: preview || "",
              description: metadata.description || "",
            };
          })
          .filter((item) => item.id && item.image)
          .slice(0, 6);

        if (!results.length) throw new Error("No matching images were returned.");
        if (!controller.signal.aborted) setItems(results);
      } catch (err) {
        if (err.name !== "AbortError" && !controller.signal.aborted) {
          setError("NASA image feed is temporarily unavailable. The 3D Mars environment is still active.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadNasaImages();
    return () => controller.abort();
  }, [rover]);

  const panelStyle = {
    position: "absolute",
    top: 148,
    left: 24,
    width: "min(310px, calc(100vw - 48px))",
    maxHeight: "calc(100vh - 235px)",
    overflowY: "auto",
    padding: 13,
    color: "#dcecff",
    background: "linear-gradient(145deg, rgba(7,17,32,.94), rgba(8,20,36,.82))",
    border: "1px solid rgba(231,123,77,.32)",
    borderRadius: 9,
    boxShadow: "0 12px 38px rgba(0,0,0,.3)",
    backdropFilter: "blur(12px)",
    zIndex: 4,
    pointerEvents: "auto",
  };

  const tabStyle = (active) => ({
    flex: 1,
    border: active ? "1px solid rgba(231,123,77,.75)" : "1px solid rgba(140,160,185,.18)",
    background: active ? "rgba(181,75,39,.24)" : "rgba(10,22,38,.65)",
    color: active ? "#ffe0d1" : "#91a8c1",
    borderRadius: 5,
    padding: "7px 5px",
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: 1,
    cursor: "pointer",
  });

  return (
    <section style={panelStyle} aria-label="NASA Mars mission image archive">
      <div style={{ color: "#f08b5c", fontSize: 9, letterSpacing: 2, fontWeight: 800 }}>
        NASA DATA LINK / MARS ARCHIVE
      </div>
      <div style={{ fontSize: 15, fontWeight: 750, marginTop: 6 }}>
        Rover image feed
      </div>
      <div style={{ color: "#91a8c1", fontSize: 10, lineHeight: 1.5, marginTop: 4 }}>
        Archived mission imagery from NASA's Image and Video Library
      </div>

      <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
        <button type="button" style={tabStyle(rover === "Perseverance")} onClick={() => setRover("Perseverance")}>
          PERSEVERANCE
        </button>
        <button type="button" style={tabStyle(rover === "Curiosity")} onClick={() => setRover("Curiosity")}>
          CURIOSITY
        </button>
      </div>

      {loading && (
        <div style={{ padding: "18px 4px", color: "#a9bfd5", fontSize: 11 }}>
          Connecting to NASA archiveâ€¦
        </div>
      )}

      {!loading && error && (
        <div style={{ padding: "14px 4px", color: "#ffc2a8", fontSize: 10, lineHeight: 1.6 }}>
          {error}
        </div>
      )}

      {!loading && !error && (
        <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
          {items.map((item) => (
            <a
              key={item.id}
              href={`https://images.nasa.gov/details/${encodeURIComponent(item.id)}`}
              target="_blank"
              rel="noreferrer"
              title="Open this item in NASA's image library"
              style={{
                display: "grid",
                gridTemplateColumns: "92px minmax(0, 1fr)",
                gap: 9,
                color: "inherit",
                textDecoration: "none",
                paddingBottom: 9,
                borderBottom: "1px solid rgba(130,160,190,.15)",
              }}
            >
              <img
                src={item.image}
                alt={item.title}
                loading="lazy"
                style={{
                  width: 92,
                  height: 68,
                  objectFit: "cover",
                  borderRadius: 5,
                  background: "#101b2a",
                }}
              />
              <span style={{ minWidth: 0 }}>
                <span style={{
                  display: "block",
                  fontSize: 10,
                  lineHeight: 1.4,
                  fontWeight: 700,
                  color: "#e4effb",
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}>
                  {item.title}
                </span>
                <span style={{ display: "block", marginTop: 5, color: "#f0a17b", fontSize: 9 }}>
                  {item.date}
                </span>
                <span style={{ display: "block", marginTop: 3, color: "#829bb5", fontSize: 8 }}>
                  {item.center}
                </span>
                <span style={{ display: "block", marginTop: 3, color: "#91a8c1", fontSize: 8 }}>
                  Location: {item.location}
                </span>
                <span style={{ display: "block", marginTop: 3, color: "#91a8c1", fontSize: 8 }}>
                  Photographer: {item.photographer}
                </span>
                {item.keywords.length > 0 && (
                  <span style={{
                    display: "block",
                    marginTop: 4,
                    color: "#e0a17e",
                    fontSize: 8,
                    lineHeight: 1.5
                  }}>
                    Tags: {item.keywords.slice(0, 4).join(" · ")}
                  </span>
                )}
                {item.description && (
                  <span style={{
                    display: "block",
                    marginTop: 7,
                    padding: "6px 7px",
                    borderLeft: "2px solid #e0a17e",
                    background: "rgba(224,161,126,0.07)",
                    color: "#c0d0e2",
                    fontSize: 8,
                    lineHeight: 1.6
                  }}>
                    <strong style={{ color: "#f0a17b" }}>
                      MISSION INTELLIGENCE
                    </strong>
                    <br />
                    {item.description.slice(0, 260)}
                    {item.description.length > 260 ? "..." : ""}
                  </span>
                )}
              </span>
            </a>
          ))}
        </div>
      )}

      <div style={{ marginTop: 9, color: "#7189a3", fontSize: 8, lineHeight: 1.5 }}>
        Source: NASA Image and Video Library Â· Select an image to view its NASA record
      </div>
    </section>
  );
}

function Scene({ mission, missionStage }) {
  return (
    <>
      <color attach="background" args={["#020611"]} />
      <fog attach="fog" args={["#020611", 16, 32]} />

      <ambientLight intensity={0.52} />
      <hemisphereLight args={["#9fcfff", "#101827", 0.38]} />

      {/* Sun key light */}
      <directionalLight
        position={[6, 3.5, 7]}
        intensity={3.8}
        color="#fff0d8"
      />

      {/* Cool reflected fill */}
      <directionalLight
        position={[-6, -2, -5]}
        intensity={0.62}
        color="#3678c9"
      />

      {mission === "earth" && (
        <>
          <Earth />
          <LunarReferenceOrbit />
          <Moon />
        </>
      )}
      {mission === "lunar" && <Moon focused />}
      {mission === "mars" && <Mars />}
      <OrbitalSystem orbitColor={mission === "mars" ? "#e77b4d" : mission === "lunar" ? "#b7c6d8" : "#4b9bd6"} missionStage={missionStage} />

      <Stars
        radius={100}
        depth={70}
        count={5200}
        factor={2.6}
        saturation={0.15}
        fade
        speed={0.22}
      />

      <OrbitControls
        makeDefault
        target={[0, 0, 0]}
        enablePan={false}
        minDistance={7.2}
        maxDistance={15}
        minPolarAngle={0.65}
        maxPolarAngle={2.45}
        autoRotate
        autoRotateSpeed={0.12}
        dampingFactor={0.06}
        enableDamping
      />
    </>
  );
}

const hudPanel = {
  position: "absolute",
  padding: "13px 16px",
  background: "linear-gradient(135deg, rgba(8,20,39,.78), rgba(4,12,26,.42))",
  border: "1px solid rgba(105,174,226,.2)",
  borderRadius: 8,
  boxShadow: "0 8px 30px rgba(0,0,0,.18)",
  backdropFilter: "blur(8px)",
  pointerEvents: "none",
};

const MISSION_CONFIG = {
  earth: { title: "EARTH ORBIT", subtitle: "LOW EARTH ORBIT Â· EARTH OBSERVATION", id: "MC-LEO-001", status: "EARTH OBSERVATION PROFILE" },
  lunar: { title: "LUNAR EXPLORATION", subtitle: "LUNAR ORBIT Â· DEEP SPACE OPERATIONS", id: "MC-LUNAR-002", status: "LUNAR ORBIT PROFILE" },
  mars: { title: "MARS RECONNAISSANCE", subtitle: "MARS ORBIT Â· PLANETARY SCIENCE", id: "MC-MARS-003", status: "MARS ORBITER PROFILE" },
};

export default function SpaceScene() {
  const [mission, setMission] = useState("earth");
  const [missionStage, setMissionStage] = useState(1);
  const activeMission = MISSION_CONFIG[mission];

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        minHeight: 560,
        background: "#020611",
        position: "relative",
        overflow: "hidden",
        fontFamily: "Inter, Arial, sans-serif",
      }}
    >
      <Canvas
        camera={{ position: [0, 1.05, 12.1], fov: 42 }}
        dpr={[1, 1.6]}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.12,
        }}
      >
        <Scene mission={mission} missionStage={missionStage} />
      </Canvas>

      {mission === "mars" && <NasaMarsDataPanel />}

      {/* Mission selector */}
      <div style={{
        ...hudPanel, top: 22, left: "50%", transform: "translateX(-50%)",
        display: "flex", gap: 6, padding: 7, pointerEvents: "auto", zIndex: 5,
      }}>
        {[{ id: "earth", label: "EARTH" }, { id: "lunar", label: "MOON" }, { id: "mars", label: "MARS" }].map((item) => (
          <button
            key={item.id}
            onClick={() => setMission(item.id)}
            style={{
              border: mission === item.id ? "1px solid rgba(100,196,255,.75)" : "1px solid transparent",
              background: mission === item.id ? "rgba(41,116,170,.32)" : "rgba(5,15,29,.28)",
              color: mission === item.id ? "#dff4ff" : "#829bb5",
              borderRadius: 5, padding: "9px 15px", cursor: "pointer",
              fontSize: 10, fontWeight: 700, letterSpacing: 1.5,
            }}
          >{item.label}</button>
        ))}
      </div>

      {/* Mission Control */}
      <div style={{
        position: "absolute",
        top: 180,
        right: 24,
        width: 205,
        padding: 12,
        background: "linear-gradient(145deg, rgba(7,17,32,.94), rgba(8,20,36,.86))",
        border: "1px solid rgba(100,196,255,.28)",
        borderRadius: 9,
        color: "#dcecff",
        zIndex: 5,
        pointerEvents: "auto",
        backdropFilter: "blur(12px)",
      }}>
        <div style={{
          color: "#64c4ff",
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: 2
        }}>
          MISSION CONTROL
        </div>

        <div style={{ marginTop: 6, fontSize: 9, color: "#91a8c1" }}>
          FLIGHT SEQUENCE · {missionStage + 1}/6
        </div>

        <div style={{
          height: 4,
          background: "rgba(120,150,180,.18)",
          borderRadius: 5,
          marginTop: 9,
          overflow: "hidden"
        }}>
          <div style={{
            width: `${((missionStage + 1) / 6) * 100}%`,
            height: "100%",
            background: "#64c4ff",
            transition: "width .3s ease"
          }} />
        </div>

        {[
          "Launch",
          "Orbital Insertion",
          "Transfer Trajectory",
          "Planetary Approach",
          "Landing Sequence",
          "Rover Deployment"
        ].map((label, index) => (
          <button
            key={label}
            onClick={() => setMissionStage(index)}
            style={{
              display: "block",
              width: "100%",
              textAlign: "left",
              marginTop: 7,
              padding: "8px 9px",
              borderRadius: 5,
              cursor: "pointer",
              border: missionStage === index
                ? "1px solid rgba(100,196,255,.7)"
                : "1px solid rgba(140,160,185,.13)",
              background: missionStage === index
                ? "rgba(41,116,170,.28)"
                : "rgba(10,22,38,.5)",
              color: missionStage === index ? "#e4f5ff" : "#91a8c1",
              fontSize: 9,
              fontWeight: 700,
            }}
          >
            <span style={{ color: "#64c4ff", marginRight: 8 }}>
              {String(index + 1).padStart(2, "0")}
            </span>
            {label}
            {index < missionStage && (
              <span style={{ float: "right", color: "#78e0b0" }}>✓</span>
            )}
          </button>
        ))}
      </div>
      {/* Top-left mission identity */}
      <div style={{ ...hudPanel, top: 22, left: 24, color: "#e6f2ff" }}>
        <div style={{ fontSize: 10, letterSpacing: 3, color: "#64c4ff" }}>
          MISSIONCRAFT / FLIGHT OPERATIONS
        </div>
        <div style={{ fontSize: 24, fontWeight: 750, marginTop: 7, letterSpacing: 0.5 }}>
          {activeMission.title}
        </div>
        <div style={{ fontSize: 10, color: "#8da7c4", marginTop: 5, letterSpacing: 1.2 }}>
          {activeMission.subtitle}
        </div>
      </div>

      {/* Top-right spacecraft status */}
      <div
        style={{
          ...hudPanel,
          top: 22,
          right: 24,
          color: "#dcecff",
          textAlign: "right",
          minWidth: 174,
        }}
      >
        <div style={{ fontSize: 10, letterSpacing: 2, color: "#64c4ff" }}>
          SPACECRAFT STATUS
        </div>
        <div style={{ marginTop: 9, fontSize: 13, color: "#78e0b0" }}>
          â— VISUAL MODEL ACTIVE
        </div>
        <div style={{ color: "#8da7c4", marginTop: 7, fontSize: 10 }}>
          {activeMission.status}
        </div>
        <div style={{ color: "#8da7c4", marginTop: 5, fontSize: 10 }}>
          {mission === "mars" ? "MARS SURFACE MAP: LOADED" : mission === "lunar" ? "LUNAR SURFACE MAP: LOADED" : "EARTH + LUNAR VIEW: LOADED"}
        </div>
      </div>

      {/* Bottom-left mission label */}
      <div
        style={{
          ...hudPanel,
          bottom: 20,
          left: 24,
          color: "#8da7c4",
          fontSize: 9,
          letterSpacing: 1.4,
        }}
      >
        MISSION ID: {activeMission.id}
        <span style={{ marginLeft: 16, color: "#64c4ff" }}>â— {mission.toUpperCase()} ENVIRONMENT</span>
      </div>

      {/* Bottom-right controls */}
      <div
        style={{
          ...hudPanel,
          bottom: 20,
          right: 24,
          color: "#8da7c4",
          fontSize: 9,
          letterSpacing: 0.7,
        }}
      >
        DRAG TO ROTATE Â· SCROLL TO ZOOM
      </div>

      {/* Planet texture attribution */}
      {mission === "mars" && (
        <div style={{ position: "absolute", bottom: 22, left: "50%", transform: "translateX(-50%)", color: "rgba(160,180,202,.62)", fontSize: 9, letterSpacing: 0.4, whiteSpace: "nowrap", pointerEvents: "none" }}>
          MARS MAP: SOLAR SYSTEM SCOPE Â· CC BY 4.0 Â· BASED ON NASA IMAGERY
        </div>
      )}

      {/* Subtle center reticle */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 18,
          height: 18,
          transform: "translate(-50%, -50%)",
          border: "1px solid rgba(115,190,245,.2)",
          borderRadius: "50%",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}



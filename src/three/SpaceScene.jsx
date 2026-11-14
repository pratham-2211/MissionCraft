
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { useRef } from "react";

function Planet() {
  return (
    <mesh position={[0, 0, -2]}>
      <sphereGeometry args={[2, 64, 64]} />
      <meshStandardMaterial
        color="#1769aa"
        roughness={0.8}
        metalness={0.1}
      />
    </mesh>
  );
}

function Spacecraft() {
  const craft = useRef();

  useFrame((state, delta) => {
    if (craft.current) {
      craft.current.position.x = Math.sin(state.clock.elapsedTime * 0.4) * 2.5;
      craft.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <group ref={craft} position={[0, 0.5, 2]}>
      {/* Spacecraft body */}
      <mesh>
        <cylinderGeometry args={[0.25, 0.35, 1.2, 16]} />
        <meshStandardMaterial color="#dce5f2" metalness={0.7} />
      </mesh>

      {/* Left solar panel */}
      <mesh position={[-0.9, 0, 0]}>
        <boxGeometry args={[1.2, 0.06, 0.65]} />
        <meshStandardMaterial color="#2875d0" metalness={0.5} />
      </mesh>

      {/* Right solar panel */}
      <mesh position={[0.9, 0, 0]}>
        <boxGeometry args={[1.2, 0.06, 0.65]} />
        <meshStandardMaterial color="#2875d0" metalness={0.5} />
      </mesh>

      {/* Antenna */}
      <mesh position={[0, 0.8, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.5, 8]} />
        <meshStandardMaterial color="white" />
      </mesh>
    </group>
  );
}

export default function SpaceScene() {
  return (
    <div style={{ width: "100%", height: "500px", background: "#020617" }}>
      <Canvas camera={{ position: [0, 2, 9], fov: 50 }}>
        <ambientLight intensity={1} />
        <directionalLight position={[5, 5, 5]} intensity={2} />
        <Stars radius={100} depth={50} count={3000} factor={4} />
        <Planet />
        <Spacecraft />
        <OrbitControls enableZoom enablePan />
      </Canvas>
    </div>
  );
}

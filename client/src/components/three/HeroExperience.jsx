import { Float, OrbitControls, Sparkles } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";

const balloonPositions = [
  { position: [-2.8, 1.8, 0.4], color: "#4bf4ff" },
  { position: [0, 2.5, -0.8], color: "#ff4ecd" },
  { position: [2.6, 1.7, 0.2], color: "#ffd166" },
  { position: [1.8, 3.1, -1], color: "#7cf5b3" }
];

function Balloon({ position, color }) {
  const ref = useRef(null);

  useFrame((state) => {
    if (!ref.current) {
      return;
    }

    ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.2;
    ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5 + position[0]) * 0.15;
  });

  return (
    <group ref={ref} position={position}>
      <mesh castShadow>
        <sphereGeometry args={[0.42, 32, 32]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35} roughness={0.25} />
      </mesh>
      <mesh position={[0, -1.1, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.01, 0.01, 1.7, 8]} />
        <meshStandardMaterial color="#d8f9ff" />
      </mesh>
    </group>
  );
}

function CakeStage() {
  const ref = useRef(null);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });

  return (
    <group ref={ref} position={[0, -1.15, 0]}>
      <mesh receiveShadow>
        <cylinderGeometry args={[2.8, 3.2, 0.28, 48]} />
        <meshStandardMaterial color="#141f38" metalness={0.25} roughness={0.45} />
      </mesh>
      <mesh position={[0, 0.38, 0]} castShadow>
        <cylinderGeometry args={[1.55, 1.85, 0.65, 48]} />
        <meshStandardMaterial color="#f9c1f0" emissive="#ff4ecd" emissiveIntensity={0.08} />
      </mesh>
      <mesh position={[0, 0.88, 0]} castShadow>
        <cylinderGeometry args={[1.05, 1.32, 0.45, 48]} />
        <meshStandardMaterial color="#fdf4ff" emissive="#4bf4ff" emissiveIntensity={0.08} />
      </mesh>
      {[-0.55, 0, 0.55].map((x) => (
        <group key={x} position={[x, 1.28, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.06, 0.06, 0.45, 12]} />
            <meshStandardMaterial color="#ffe8a3" />
          </mesh>
          <mesh position={[0, 0.3, 0]} castShadow>
            <sphereGeometry args={[0.09, 16, 16]} />
            <meshStandardMaterial color="#ffb703" emissive="#ffb703" emissiveIntensity={2.2} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export default function HeroExperience() {
  return (
    <div className="relative h-[420px] w-full overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/60 shadow-glow backdrop-blur-xl sm:h-[520px]">
      <Canvas camera={{ position: [0, 1.4, 6], fov: 45 }} shadows>
        <color attach="background" args={["#070b1a"]} />
        <fog attach="fog" args={["#070b1a", 7, 14]} />
        <ambientLight intensity={0.9} />
        <directionalLight position={[4, 8, 4]} intensity={1.6} color="#b4f3ff" castShadow />
        <pointLight position={[-3, 2, 4]} intensity={28} color="#ff4ecd" />
        <pointLight position={[3, 2, 4]} intensity={24} color="#4bf4ff" />
        <Float speed={1.6} rotationIntensity={0.35} floatIntensity={0.5}>
          <CakeStage />
        </Float>
        {balloonPositions.map((balloon) => (
          <Balloon key={balloon.position.join("-")} {...balloon} />
        ))}
        <Sparkles count={120} size={2.4} scale={8} speed={0.5} color="#dffcff" />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.45, 0]} receiveShadow>
          <circleGeometry args={[6, 64]} />
          <meshStandardMaterial color="#081022" />
        </mesh>
        <OrbitControls enablePan={false} enableZoom={false} autoRotate autoRotateSpeed={0.8} />
      </Canvas>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#050816] to-transparent" />
    </div>
  );
}

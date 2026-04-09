import { Float, Sparkles } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";

function GiftCore({ accent, glow }) {
  const ref = useRef(null);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.55;
      ref.current.position.y = Math.sin(state.clock.elapsedTime * 0.9) * 0.2;
    }
  });

  return (
    <group ref={ref}>
      <mesh castShadow>
        <boxGeometry args={[1.7, 1.7, 1.7]} />
        <meshStandardMaterial color={accent} emissive={glow} emissiveIntensity={0.25} roughness={0.18} metalness={0.28} />
      </mesh>
      <mesh position={[0, 1, 0]} castShadow>
        <boxGeometry args={[1.9, 0.18, 1.9]} />
        <meshStandardMaterial color={glow} emissive={glow} emissiveIntensity={0.35} />
      </mesh>
      <mesh castShadow>
        <boxGeometry args={[0.22, 2, 0.22]} />
        <meshStandardMaterial color="#fff1d6" />
      </mesh>
      <mesh castShadow>
        <boxGeometry args={[2, 0.22, 0.22]} />
        <meshStandardMaterial color="#fff1d6" />
      </mesh>
    </group>
  );
}

export default function WishExperience({ accent = "#ff4ecd", glow = "#4bf4ff" }) {
  return (
    <div className="relative h-80 overflow-hidden rounded-[2rem] border border-white/10 bg-[#081122]/80">
      <Canvas camera={{ position: [0, 1.6, 5], fov: 46 }}>
        <color attach="background" args={["#081122"]} />
        <ambientLight intensity={1} />
        <pointLight position={[2, 3, 2]} intensity={26} color={glow} />
        <pointLight position={[-2, 2, 2]} intensity={20} color={accent} />
        <spotLight position={[0, 5, 4]} angle={0.45} intensity={2.1} penumbra={0.6} castShadow />
        <Float speed={1.8} rotationIntensity={0.35} floatIntensity={0.75}>
          <GiftCore accent={accent} glow={glow} />
        </Float>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.3, 0]}>
          <circleGeometry args={[5, 64]} />
          <meshStandardMaterial color="#07101f" />
        </mesh>
        <Sparkles count={90} size={2} scale={6} color={glow} speed={0.7} />
      </Canvas>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#081122]" />
    </div>
  );
}

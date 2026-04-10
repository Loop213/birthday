import { Float } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import { playCandleBlowSound } from "../../../utils/soundEffects.js";
import { NameText3D, SceneFloor, SceneSparkles } from "./shared.jsx";

function Candle({ position, isLit }) {
  const flameRef = useRef(null);

  useFrame((state) => {
    if (flameRef.current && isLit) {
      flameRef.current.scale.y = 0.85 + Math.sin(state.clock.elapsedTime * 8 + position[0]) * 0.12;
      flameRef.current.position.y = 0.22 + Math.sin(state.clock.elapsedTime * 10 + position[0]) * 0.02;
    }
  });

  return (
    <group position={position}>
      <mesh castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.45, 12]} />
        <meshStandardMaterial color="#fff3b0" />
      </mesh>
      {isLit ? (
        <mesh ref={flameRef} position={[0, 0.24, 0]} castShadow>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color="#ffbf69" emissive="#ff9f1c" emissiveIntensity={2.4} />
        </mesh>
      ) : null}
    </group>
  );
}

export default function CakeCelebrationScene({ wish, onCelebrate }) {
  const stageRef = useRef(null);
  const [candlesLit, setCandlesLit] = useState(true);
  const candles = useMemo(() => [-0.7, -0.25, 0.25, 0.7], []);

  useFrame((state) => {
    if (stageRef.current) {
      stageRef.current.rotation.y = state.clock.elapsedTime * 0.22;
    }
  });

  function handleBlowCandles() {
    if (!candlesLit) {
      return;
    }

    setCandlesLit(false);
    playCandleBlowSound();
    onCelebrate?.({ type: "cake" });
  }

  return (
    <>
      <color attach="background" args={["#110713"]} />
      <fog attach="fog" args={["#110713", 8, 14]} />
      <ambientLight intensity={0.85} />
      <directionalLight position={[5, 7, 5]} intensity={1.8} color="#fff2c2" castShadow />
      <pointLight position={[-3, 2, 4]} intensity={16} color="#ff4ecd" />
      <pointLight position={[3, 2, 4]} intensity={18} color="#ffd166" />
      <NameText3D text={wish.recipientName} position={[0, 2.45, 0]} color="#fff5f8" emissive="#ff4ecd" />
      <Float speed={1.4} rotationIntensity={0.22} floatIntensity={0.35}>
        <group ref={stageRef} position={[0, -0.25, 0]} onClick={handleBlowCandles}>
          <mesh receiveShadow>
            <cylinderGeometry args={[2.35, 2.75, 0.3, 60]} />
            <meshStandardMaterial color="#16172c" metalness={0.24} roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.42, 0]} castShadow>
            <cylinderGeometry args={[1.48, 1.78, 0.68, 60]} />
            <meshStandardMaterial color="#ffbedf" emissive="#ff8fb8" emissiveIntensity={0.1} />
          </mesh>
          <mesh position={[0, 0.9, 0]} castShadow>
            <cylinderGeometry args={[1.02, 1.24, 0.5, 60]} />
            <meshStandardMaterial color="#fff6fb" emissive="#ffffff" emissiveIntensity={0.08} />
          </mesh>
          {candles.map((x) => (
            <Candle key={x} position={[x, 1.28, 0]} isLit={candlesLit} />
          ))}
        </group>
      </Float>
      <SceneFloor color="#12091a" />
      <SceneSparkles color="#ffe2ef" count={90} />
    </>
  );
}

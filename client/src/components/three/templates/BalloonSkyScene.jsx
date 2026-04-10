import { Cloud } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import { playBalloonPopSound } from "../../../utils/soundEffects.js";
import { NameText3D, SceneFloor, SceneSparkles } from "./shared.jsx";

function Balloon({ balloon, popped, onPop }) {
  const ref = useRef(null);

  useFrame((state) => {
    if (!ref.current || popped) {
      return;
    }

    ref.current.position.y = balloon.position[1] + Math.sin(state.clock.elapsedTime + balloon.id) * 0.22;
    ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.4 + balloon.id) * 0.18;
  });

  if (popped) {
    return null;
  }

  return (
    <group ref={ref} position={balloon.position} onClick={() => onPop(balloon)}>
      <mesh castShadow>
        <sphereGeometry args={[0.44, 28, 28]} />
        <meshStandardMaterial color={balloon.color} emissive={balloon.color} emissiveIntensity={0.28} />
      </mesh>
      <mesh position={[0, -1.1, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.01, 0.01, 1.8, 8]} />
        <meshStandardMaterial color="#eef9ff" />
      </mesh>
    </group>
  );
}

function DriftCloud({ position, speed, opacity, scale }) {
  const ref = useRef(null);

  useFrame((state) => {
    if (!ref.current) {
      return;
    }

    ref.current.position.x = position[0] + Math.sin(state.clock.elapsedTime * speed) * 0.65;
  });

  return (
    <group ref={ref} position={position}>
      <Cloud speed={speed} opacity={opacity} scale={scale} />
    </group>
  );
}

export default function BalloonSkyScene({ wish, onCelebrate }) {
  const [poppedIds, setPoppedIds] = useState([]);
  const balloons = useMemo(
    () => [
      { id: 1, position: [-2.8, 1.8, 0.6], color: "#4bf4ff" },
      { id: 2, position: [-1.2, 2.7, -0.4], color: "#ff6bb5" },
      { id: 3, position: [0.6, 1.9, 0.2], color: "#ffd166" },
      { id: 4, position: [2.4, 2.9, -0.6], color: "#7ea6ff" },
      { id: 5, position: [3.2, 1.6, 0.4], color: "#7cf5b3" }
    ],
    []
  );

  function popBalloon(balloon) {
    if (poppedIds.includes(balloon.id)) {
      return;
    }

    setPoppedIds((current) => [...current, balloon.id]);
    playBalloonPopSound();
    onCelebrate?.({ type: "balloon", position: balloon.position });
  }

  return (
    <>
      <color attach="background" args={["#6fc8ff"]} />
      <fog attach="fog" args={["#6fc8ff", 12, 22]} />
      <ambientLight intensity={1.15} />
      <directionalLight position={[4, 8, 4]} intensity={1.6} color="#ffffff" castShadow />
      <pointLight position={[-4, 3, 2]} intensity={16} color="#7ea6ff" />
      <DriftCloud position={[-3.6, 1.7, -4]} speed={0.12} opacity={0.45} scale={0.95} />
      <DriftCloud position={[3.5, 2.6, -5]} speed={0.08} opacity={0.38} scale={1.1} />
      <DriftCloud position={[0, 3.4, -6]} speed={0.1} opacity={0.42} scale={1.25} />
      <NameText3D text={wish.recipientName} position={[0, 2.7, -0.1]} size={0.34} color="#ffffff" emissive="#4bf4ff" />
      {balloons.map((balloon) => (
        <Balloon
          key={balloon.id}
          balloon={balloon}
          popped={poppedIds.includes(balloon.id)}
          onPop={popBalloon}
        />
      ))}
      <SceneFloor color="#b7e4ff" />
      <SceneSparkles color="#ffffff" count={70} scale={10} />
    </>
  );
}

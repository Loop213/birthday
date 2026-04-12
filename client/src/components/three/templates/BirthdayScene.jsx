import { Cloud, Sparkles, Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { playBalloonPopSound } from "../../../utils/soundEffects.js";
import PremiumCakeModel from "./PremiumCakeModel.jsx";
import { SceneFloor } from "./shared.jsx";

const LETTERS = [
  { letter: "H", target: [-2.8, 2.25, 0.1], color: "#ff7aa8" },
  { letter: "A", target: [-1.8, 2.25, 0.15], color: "#ffd166" },
  { letter: "P", target: [-0.78, 2.25, 0.1], color: "#7ea6ff" },
  { letter: "P", target: [0.22, 2.25, 0.15], color: "#7cf5b3" },
  { letter: "Y", target: [1.25, 2.25, 0.1], color: "#ff8fb8" },
  { letter: "B", target: [-3.65, 1.02, 0.18], color: "#4bf4ff" },
  { letter: "I", target: [-2.72, 1.02, 0.14], color: "#ffb703" },
  { letter: "R", target: [-1.82, 1.02, 0.16], color: "#f28482" },
  { letter: "T", target: [-0.9, 1.02, 0.15], color: "#7ea6ff" },
  { letter: "H", target: [0.02, 1.02, 0.14], color: "#f472b6" },
  { letter: "D", target: [0.96, 1.02, 0.12], color: "#ffd166" },
  { letter: "A", target: [1.92, 1.02, 0.14], color: "#7cf5b3" },
  { letter: "Y", target: [2.88, 1.02, 0.12], color: "#4bf4ff" }
];

function GlowingBulbs() {
  const bulbs = useMemo(
    () =>
      Array.from({ length: 11 }, (_, index) => ({
        id: index,
        x: -4.5 + index * 0.9,
        color: ["#ff8fb8", "#ffd166", "#4bf4ff", "#7ea6ff"][index % 4]
      })),
    []
  );

  return (
    <group position={[0, 4.1, -0.8]}>
      {bulbs.map((bulb) => (
        <group key={bulb.id} position={[bulb.x, 0, 0]}>
          <mesh position={[0, 0.18, 0]}>
            <sphereGeometry args={[0.12, 18, 18]} />
            <meshStandardMaterial color={bulb.color} emissive={bulb.color} emissiveIntensity={0.85} />
          </mesh>
          <mesh position={[0, -0.08, 0]} rotation={[0, 0, 0]}>
            <cylinderGeometry args={[0.012, 0.012, 0.32, 8]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function PartyBanner({ visible }) {
  return (
    <group position={[0, 3.42, -0.45]}>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[5.7, 0.42, 0.06]} />
        <meshStandardMaterial color="#26153c" emissive="#7c3aed" emissiveIntensity={visible ? 0.2 : 0.08} />
      </mesh>
      <Text
        position={[0, -0.02, 0.05]}
        fontSize={0.18}
        color="#fdf2f8"
        anchorX="center"
        anchorY="middle"
      >
        Balloon Birthday Story
      </Text>
    </group>
  );
}

function BalloonLetter({ config, progress, popped, onPop }) {
  const ref = useRef(null);
  const randomStart = config.start;

  useFrame((state) => {
    if (!ref.current || popped) {
      return;
    }

    const elapsed = state.clock.elapsedTime;
    const baseX = THREE.MathUtils.lerp(randomStart[0], config.target[0], progress);
    const baseY = THREE.MathUtils.lerp(randomStart[1], config.target[1], progress);
    const baseZ = THREE.MathUtils.lerp(randomStart[2], config.target[2], progress);
    const driftAmount = 1 - progress * 0.82;

    ref.current.position.x = baseX + Math.sin(elapsed * 0.9 + config.id) * 0.08 * driftAmount;
    ref.current.position.y = baseY + Math.sin(elapsed * 1.6 + config.id * 0.6) * 0.16 * driftAmount;
    ref.current.position.z = baseZ + Math.cos(elapsed * 1.1 + config.id) * 0.06 * driftAmount;
    ref.current.rotation.z = Math.sin(elapsed * 0.72 + config.id) * 0.08 * driftAmount;
  });

  if (popped) {
    return null;
  }

  return (
    <group ref={ref} onClick={() => onPop(config)}>
      <mesh castShadow>
        <sphereGeometry args={[0.5, 28, 28]} />
        <meshStandardMaterial color={config.color} emissive={config.color} emissiveIntensity={0.32} roughness={0.46} />
      </mesh>
      <mesh position={[0, -0.92, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.012, 0.012, 1.45, 10]} />
        <meshStandardMaterial color="#eff6ff" />
      </mesh>
      <Text
        position={[0, -0.02, 0.52]}
        fontSize={0.3}
        fontWeight={800}
        color="#ffffff"
        outlineWidth={0.015}
        outlineColor="#0f172a"
        anchorX="center"
        anchorY="middle"
      >
        {config.letter}
      </Text>
    </group>
  );
}

function FloatingCloud({ position, speed, scale, opacity }) {
  const ref = useRef(null);

  useFrame((state) => {
    if (!ref.current) {
      return;
    }

    ref.current.position.x = position[0] + Math.sin(state.clock.elapsedTime * speed) * 0.35;
  });

  return (
    <group ref={ref} position={position}>
      <Cloud speed={speed} opacity={opacity} scale={scale} />
    </group>
  );
}

function Candle({ position }) {
  const flameRef = useRef(null);

  useFrame((state) => {
    if (!flameRef.current) {
      return;
    }

    flameRef.current.scale.y = 0.9 + Math.sin(state.clock.elapsedTime * 12) * 0.12;
    flameRef.current.position.y = 0.3 + Math.sin(state.clock.elapsedTime * 8) * 0.03;
  });

  return (
    <group position={position}>
      <mesh castShadow position={[0, 0.17, 0]}>
        <cylinderGeometry args={[0.045, 0.045, 0.36, 12]} />
        <meshStandardMaterial color="#fff4d6" />
      </mesh>
      <mesh ref={flameRef} position={[0, 0.3, 0]}>
        <sphereGeometry args={[0.08, 14, 14]} />
        <meshStandardMaterial color="#ffd166" emissive="#ff9f1c" emissiveIntensity={1.15} />
      </mesh>
      <pointLight position={[0, 0.32, 0]} intensity={6} distance={1.8} color="#ffb347" />
    </group>
  );
}

function CakeStage({ visible }) {
  return (
    <group position={[0, -0.88, 0.1]} scale={visible ? 0.46 : 0.001}>
      <PremiumCakeModel>
        <group position={[0, 0.2, 0]}>
          <Candle position={[-0.52, 1.72, 0.15]} />
          <Candle position={[0, 1.78, 0]} />
          <Candle position={[0.52, 1.72, -0.15]} />
        </group>
      </PremiumCakeModel>
    </group>
  );
}

export default function BirthdayScene({ wish, replayToken = 0, onCelebrate, onPrimaryInteraction }) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState("float");
  const [poppedIds, setPoppedIds] = useState([]);
  const celebrationSentRef = useRef(false);
  const balloons = useMemo(
    () =>
      LETTERS.map((item, index) => ({
        ...item,
        id: index + 1,
        start: [
          -4.6 + ((index * 1.17) % 9.1),
          0.75 + ((index * 0.58) % 3.2),
          -1.1 + ((index * 0.27) % 2.2)
        ]
      })),
    []
  );

  useEffect(() => {
    setPhase("float");
    setProgress(0);
    setPoppedIds([]);
    celebrationSentRef.current = false;

    const alignTimer = window.setTimeout(() => {
      setPhase("align");
    }, 2400);

    const celebrateTimer = window.setTimeout(() => {
      setPhase("celebrate");
    }, 6200);

    return () => {
      window.clearTimeout(alignTimer);
      window.clearTimeout(celebrateTimer);
    };
  }, [replayToken]);

  useFrame((_, delta) => {
    if (phase === "align" || phase === "celebrate") {
      setProgress((current) => Math.min(current + delta * 0.36, 1));
    }
  });

  useEffect(() => {
    if (progress >= 0.995 && !celebrationSentRef.current) {
      celebrationSentRef.current = true;
      onCelebrate?.({ type: "balloon" });
      onPrimaryInteraction?.({ type: "birthday-align" });
    }
  }, [onCelebrate, onPrimaryInteraction, progress]);

  function handlePop(balloon) {
    if (poppedIds.includes(balloon.id)) {
      return;
    }

    setPoppedIds((current) => [...current, balloon.id]);
    playBalloonPopSound();
    onCelebrate?.({ type: "balloon", position: balloon.target });
  }

  return (
    <>
      <color attach="background" args={["#1c1232"]} />
      <fog attach="fog" args={["#1c1232", 11, 20]} />
      <ambientLight intensity={0.95} />
      <directionalLight position={[3.5, 7, 4]} intensity={1.3} color="#fff7f1" castShadow />
      <pointLight position={[0, 2.4, 2.6]} intensity={18} color="#ff8fb8" />
      <pointLight position={[-3.8, 3.5, 1.6]} intensity={9} color="#7ea6ff" />
      <pointLight position={[3.8, 3.5, 1.6]} intensity={9} color="#4bf4ff" />

      <GlowingBulbs />
      <PartyBanner visible={phase === "celebrate"} />
      <FloatingCloud position={[-3.8, 1.6, -4.5]} speed={0.12} scale={0.9} opacity={0.35} />
      <FloatingCloud position={[3.6, 2.8, -5]} speed={0.09} scale={1.1} opacity={0.32} />
      <FloatingCloud position={[0.2, 3.1, -5.8]} speed={0.08} scale={1.2} opacity={0.28} />

      {balloons.map((balloon) => (
        <BalloonLetter
          key={balloon.id}
          config={balloon}
          progress={progress}
          popped={poppedIds.includes(balloon.id)}
          onPop={handlePop}
        />
      ))}

      {phase === "celebrate" ? (
        <Text
          position={[0, 2.62, 0.6]}
          fontSize={0.28}
          color="#fff7f7"
          outlineWidth={0.015}
          outlineColor="#7c3aed"
          anchorX="center"
          anchorY="middle"
        >
          For {wish?.recipientName || "Birthday Star"}
        </Text>
      ) : null}

      <CakeStage visible={phase === "celebrate"} />
      <SceneFloor color="#130d1f" />
      <Sparkles count={90} size={2.4} scale={[10, 7, 6]} color="#ffffff" speed={0.55} />
    </>
  );
}

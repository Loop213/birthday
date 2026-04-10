import { ContactShadows } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import { playCandleBlowSound } from "../../../utils/soundEffects.js";
import { NameText3D, SceneFloor, SceneSparkles } from "./shared.jsx";
import PremiumCakeModel from "./PremiumCakeModel.jsx";

function Candle({ position, isLit }) {
  const flameRef = useRef(null);
  const emberRef = useRef(null);

  useFrame((state) => {
    if (flameRef.current && isLit) {
      flameRef.current.scale.y = 0.85 + Math.sin(state.clock.elapsedTime * 8 + position[0]) * 0.12;
      flameRef.current.position.y = 0.22 + Math.sin(state.clock.elapsedTime * 10 + position[0]) * 0.02;
    }

    if (emberRef.current && isLit) {
      emberRef.current.scale.setScalar(0.9 + Math.sin(state.clock.elapsedTime * 12 + position[0]) * 0.08);
    }
  });

  return (
    <group position={position}>
      <mesh castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.45, 12]} />
        <meshStandardMaterial color="#fff3b0" />
      </mesh>
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.012, 0.01, 0.1, 8]} />
        <meshStandardMaterial color="#322018" />
      </mesh>
      {isLit ? (
        <>
          <mesh ref={flameRef} position={[0, 0.34, 0]} castShadow>
            <coneGeometry args={[0.09, 0.24, 10]} />
            <meshStandardMaterial color="#ffcf70" emissive="#ff9f1c" emissiveIntensity={2.2} />
          </mesh>
          <mesh ref={emberRef} position={[0, 0.28, 0]}>
            <sphereGeometry args={[0.055, 12, 12]} />
            <meshStandardMaterial color="#fff4c7" emissive="#ffd166" emissiveIntensity={2.6} />
          </mesh>
        </>
      ) : null}
    </group>
  );
}

function SmokeParticles({ active }) {
  const groupRef = useRef(null);
  const particles = useMemo(
    () =>
      Array.from({ length: 16 }, (_, index) => ({
        id: index,
        originX: (Math.random() - 0.5) * 0.8,
        originZ: (Math.random() - 0.5) * 0.7,
        speed: 0.35 + Math.random() * 0.25,
        scale: 0.08 + Math.random() * 0.12
      })),
    []
  );

  useFrame((state) => {
    if (!groupRef.current) {
      return;
    }

    groupRef.current.children.forEach((child, index) => {
      const particle = particles[index];
      const drift = active ? state.clock.elapsedTime * particle.speed : 0;
      child.position.set(
        particle.originX + Math.sin(drift + particle.id) * 0.06,
        1.45 + drift * 0.42,
        particle.originZ + Math.cos(drift + particle.id) * 0.05
      );
      child.material.opacity = active ? Math.max(0.55 - drift * 0.18, 0) : 0;
    });
  });

  return (
    <group ref={groupRef}>
      {particles.map((particle) => (
        <mesh key={particle.id} scale={particle.scale}>
          <sphereGeometry args={[1, 10, 10]} />
          <meshStandardMaterial color="#d0d5df" transparent opacity={0} />
        </mesh>
      ))}
    </group>
  );
}

function CameraIntro({ replayToken = 0, hovered = false }) {
  const { camera } = useThree();

  useEffect(() => {
    gsap.killTweensOf(camera.position);
    gsap.killTweensOf(camera.rotation);

    camera.position.set(0, 3.6, 9.5);
    camera.lookAt(0, 1, 0);

    const timeline = gsap.timeline();
    timeline.to(camera.position, {
      x: 0,
      y: 1.85,
      z: 5.65,
      duration: 1.35,
      ease: "power3.out"
    });

    return () => timeline.kill();
  }, [camera, replayToken]);

  useEffect(() => {
    gsap.to(camera.position, {
      z: hovered ? 5.1 : 5.65,
      y: hovered ? 1.95 : 1.85,
      duration: 0.35,
      ease: "power2.out"
    });
  }, [camera, hovered]);

  return null;
}

export default function CakeCelebrationScene({
  wish,
  onCelebrate,
  replayToken = 0,
  onPrimaryInteraction
}) {
  const [candlesLit, setCandlesLit] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [smokeActive, setSmokeActive] = useState(false);
  const candles = useMemo(() => [-0.7, -0.25, 0.25, 0.7], []);

  useEffect(() => {
    setCandlesLit(true);
    setSmokeActive(false);
  }, [replayToken, wish?.recipientName]);

  function handleBlowCandles() {
    if (!candlesLit) {
      return;
    }

    setCandlesLit(false);
    setSmokeActive(true);
    playCandleBlowSound();
    onCelebrate?.({ type: "cake" });
    onPrimaryInteraction?.({ type: "cake-blow" });
    window.setTimeout(() => setSmokeActive(false), 2800);
  }

  return (
    <>
      <color attach="background" args={["#110713"]} />
      <fog attach="fog" args={["#110713", 8, 14]} />
      <CameraIntro replayToken={replayToken} hovered={hovered} />
      <ambientLight intensity={0.8} />
      <hemisphereLight intensity={0.55} color="#fff1ea" groundColor="#0d1022" />
      <directionalLight
        position={[5, 8, 4]}
        intensity={1.65}
        color="#fff2c2"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[0, 2.4, 1.6]} intensity={28} distance={8} color="#ffb25c" />
      <pointLight position={[-3, 2, 4]} intensity={15} color="#ff4ecd" />
      <pointLight position={[3, 2, 4]} intensity={14} color="#ffd166" />
      <NameText3D text={wish.recipientName} position={[0, 2.45, 0]} color="#fff5f8" emissive="#ff4ecd" />
      <group
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={handleBlowCandles}
      >
        <PremiumCakeModel hovered={hovered}>
          {candles.map((x) => (
            <Candle key={x} position={[x, 1.28, 0]} isLit={candlesLit} />
          ))}
          <SmokeParticles active={smokeActive} />
        </PremiumCakeModel>
      </group>
      <ContactShadows position={[0, -0.99, 0]} scale={7} blur={2.4} opacity={0.55} />
      <SceneFloor color="#12091a" />
      <SceneSparkles color="#ffe2ef" count={90} />
    </>
  );
}

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { playFireworkSound } from "../../../utils/soundEffects.js";
import { NameText3D, NightStars, SceneFloor } from "./shared.jsx";

function FireworkBurst({ burst }) {
  const geometry = useMemo(() => {
    const points = [];
    for (let index = 0; index < 36; index += 1) {
      const direction = new THREE.Vector3(
        Math.random() - 0.5,
        Math.random() - 0.2,
        Math.random() - 0.5
      )
        .normalize()
        .multiplyScalar(0.1 + Math.random() * 0.35);

      points.push(direction.x, direction.y, direction.z);
    }

    const buffer = new THREE.BufferGeometry();
    buffer.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));
    return buffer;
  }, []);

  const [life, setLife] = useState(0);

  useFrame((_state, delta) => {
    setLife((current) => Math.min(current + delta * 1.4, 1.4));
  });

  return (
    <group position={burst.position} scale={1 + life * 8}>
      <points geometry={geometry}>
        <pointsMaterial
          color={burst.color}
          size={0.12}
          transparent
          opacity={Math.max(1 - life, 0)}
          depthWrite={false}
        />
      </points>
    </group>
  );
}

export default function FireworksPartyScene({ wish, onCelebrate }) {
  const [bursts, setBursts] = useState([
    { id: 1, position: [0, 1.8, -1], color: "#ffb703" }
  ]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      triggerBurst([
        (Math.random() - 0.5) * 4.5,
        1.6 + Math.random() * 1.6,
        -1.8 + Math.random()
      ]);
    }, 2600);

    return () => window.clearInterval(timer);
  }, []);

  function triggerBurst(position = [0, 1.8, -1]) {
    const burst = {
      id: Date.now() + Math.random(),
      position,
      color: ["#ffb703", "#4bf4ff", "#ff4ecd", "#7cf5b3"][Math.floor(Math.random() * 4)]
    };

    setBursts((current) => [...current.slice(-5), burst]);
    playFireworkSound();
    onCelebrate?.({ type: "fireworks", position });
  }

  return (
    <>
      <color attach="background" args={["#050816"]} />
      <fog attach="fog" args={["#050816", 10, 20]} />
      <ambientLight intensity={0.65} />
      <directionalLight position={[4, 7, 2]} intensity={1.1} color="#a4d8ff" />
      <pointLight position={[0, 3, 2]} intensity={18} color="#4bf4ff" />
      <NightStars />
      <NameText3D text={wish.recipientName} position={[0, 2.55, 0]} emissive="#7cf5b3" />
      <NameText3D text="Party Mode" position={[0, 1.9, -0.2]} size={0.24} color="#ecfffb" emissive="#4bf4ff" />
      {bursts.map((burst) => (
        <FireworkBurst key={burst.id} burst={burst} />
      ))}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.85, 0]}
        onClick={(event) => triggerBurst([event.point.x, 1.2 + Math.random() * 2, event.point.z - 0.6])}
      >
        <planeGeometry args={[12, 12]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      <SceneFloor color="#091123" />
    </>
  );
}

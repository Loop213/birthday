import { Float } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { NameText3D, SceneFloor, SceneSparkles } from "./shared.jsx";

function romanticHeartGeometry() {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0.28);
  shape.bezierCurveTo(0, 0.5, -0.32, 0.7, -0.56, 0.48);
  shape.bezierCurveTo(-0.82, 0.24, -0.72, -0.18, -0.4, -0.34);
  shape.bezierCurveTo(-0.2, -0.44, -0.03, -0.22, 0, -0.1);
  shape.bezierCurveTo(0.03, -0.22, 0.2, -0.44, 0.4, -0.34);
  shape.bezierCurveTo(0.72, -0.18, 0.82, 0.24, 0.56, 0.48);
  shape.bezierCurveTo(0.32, 0.7, 0, 0.5, 0, 0.28);
  return new THREE.ShapeGeometry(shape);
}

function HeartParticles() {
  const groupRef = useRef(null);
  const particles = useMemo(
    () =>
      Array.from({ length: 18 }, (_, index) => ({
        id: index,
        position: [
          (Math.random() - 0.5) * 6,
          Math.random() * 4 - 0.4,
          (Math.random() - 0.5) * 5
        ],
        scale: 0.28 + Math.random() * 0.18,
        speed: 0.5 + Math.random() * 0.4
      })),
    []
  );
  const geometry = useMemo(() => romanticHeartGeometry(), []);

  useFrame((state) => {
    if (!groupRef.current) {
      return;
    }

    groupRef.current.children.forEach((child, index) => {
      const particle = particles[index];
      child.position.y = particle.position[1] + Math.sin(state.clock.elapsedTime * particle.speed + particle.id) * 0.35;
      child.rotation.z = Math.sin(state.clock.elapsedTime * 0.6 + particle.id) * 0.4;
    });
  });

  return (
    <group ref={groupRef}>
      {particles.map((particle) => (
        <mesh
          key={particle.id}
          position={particle.position}
          scale={particle.scale}
          geometry={geometry}
        >
          <meshStandardMaterial color="#ff7bac" emissive="#ff4ecd" emissiveIntensity={0.3} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

function CoupleSilhouettes() {
  const ref = useRef(null);

  useFrame((state) => {
    if (!ref.current) {
      return;
    }

    ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.18;
  });

  return (
    <group ref={ref} position={[0, -0.45, 0]}>
      <group position={[-0.5, 0, 0]}>
        <mesh position={[0, 0.55, 0]} castShadow>
          <sphereGeometry args={[0.22, 24, 24]} />
          <meshStandardMaterial color="#181321" />
        </mesh>
        <mesh castShadow>
          <cylinderGeometry args={[0.17, 0.22, 0.95, 16]} />
          <meshStandardMaterial color="#181321" />
        </mesh>
      </group>
      <group position={[0.45, 0, 0]}>
        <mesh position={[0, 0.6, 0]} castShadow>
          <sphereGeometry args={[0.22, 24, 24]} />
          <meshStandardMaterial color="#181321" />
        </mesh>
        <mesh castShadow>
          <cylinderGeometry args={[0.16, 0.28, 1.02, 16]} />
          <meshStandardMaterial color="#181321" />
        </mesh>
      </group>
      <mesh position={[0, 0.25, 0.18]} rotation={[0, 0, Math.PI / 10]}>
        <torusGeometry args={[0.72, 0.04, 16, 40, Math.PI]} />
        <meshStandardMaterial color="#ff8fb8" emissive="#ff4ecd" emissiveIntensity={0.35} />
      </mesh>
    </group>
  );
}

export default function RomanticLoveScene({ wish }) {
  return (
    <>
      <color attach="background" args={["#12081c"]} />
      <fog attach="fog" args={["#12081c", 10, 18]} />
      <ambientLight intensity={0.9} />
      <directionalLight position={[3, 6, 4]} intensity={1.45} color="#ffd4e8" castShadow />
      <pointLight position={[-3, 2, 3]} intensity={18} color="#ff4ecd" />
      <pointLight position={[3, 2, 2]} intensity={14} color="#ff9ac9" />
      <NameText3D text={wish.recipientName} position={[0, 2.45, 0]} color="#fff0f7" emissive="#ff4ecd" />
      <Float speed={1.5} rotationIntensity={0.08} floatIntensity={0.24}>
        <NameText3D text="I Love You" position={[0, 1.75, -0.3]} size={0.22} color="#ffc2db" emissive="#ff7bac" />
      </Float>
      <HeartParticles />
      <CoupleSilhouettes />
      <SceneFloor color="#1a0f25" />
      <SceneSparkles color="#ffbddc" count={100} scale={8} />
    </>
  );
}

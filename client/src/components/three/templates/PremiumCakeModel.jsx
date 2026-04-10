import { Float } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { gsap } from "gsap";
import * as THREE from "three";

function IcingDrips() {
  const drips = useMemo(
    () =>
      Array.from({ length: 14 }, (_, index) => {
        const angle = (index / 14) * Math.PI * 2;
        return {
          id: index,
          x: Math.cos(angle) * 1.44,
          z: Math.sin(angle) * 1.44,
          height: 0.18 + (index % 4) * 0.05,
          rotation: angle
        };
      }),
    []
  );

  return (
    <>
      {drips.map((drip) => (
        <mesh
          key={drip.id}
          position={[drip.x, 1.07 - drip.height / 2, drip.z]}
          rotation={[0, drip.rotation, 0]}
          castShadow
        >
          <capsuleGeometry args={[0.07, drip.height, 6, 10]} />
          <meshStandardMaterial color="#fff7ef" roughness={0.9} />
        </mesh>
      ))}
    </>
  );
}

function CakeToppers() {
  return (
    <>
      {[
        [0.38, 1.78, 0.24],
        [-0.16, 1.8, -0.28],
        [0.02, 1.86, 0.02]
      ].map((position, index) => (
        <mesh key={index} position={position} castShadow>
          <sphereGeometry args={[0.11, 22, 22]} />
          <meshStandardMaterial
            color={index === 2 ? "#ffd166" : "#f8578a"}
            metalness={index === 2 ? 0.38 : 0.05}
            roughness={index === 2 ? 0.25 : 0.45}
          />
        </mesh>
      ))}
    </>
  );
}

export default function PremiumCakeModel({ hovered = false, children }) {
  const groupRef = useRef(null);
  const introRef = useRef(null);
  const zoomRef = useRef(null);

  useEffect(() => {
    if (!groupRef.current || introRef.current) {
      return;
    }

    introRef.current = gsap.timeline();
    introRef.current
      .fromTo(
        groupRef.current.position,
        { y: -1.1, z: -0.8 },
        { y: -0.18, z: 0, duration: 1.05, ease: "power3.out" }
      )
      .fromTo(
        groupRef.current.scale,
        { x: 0.72, y: 0.72, z: 0.72 },
        { x: 1, y: 1, z: 1, duration: 0.95, ease: "back.out(1.25)" },
        "<"
      );

    return () => {
      introRef.current?.kill();
      introRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!groupRef.current) {
      return;
    }

    zoomRef.current?.kill();
    zoomRef.current = gsap.to(groupRef.current.scale, {
      x: hovered ? 1.06 : 1,
      y: hovered ? 1.06 : 1,
      z: hovered ? 1.06 : 1,
      duration: 0.35,
      ease: "power2.out"
    });

    return () => zoomRef.current?.kill();
  }, [hovered]);

  useFrame((state) => {
    if (!groupRef.current) {
      return;
    }

    groupRef.current.rotation.y = state.clock.elapsedTime * 0.22;
  });

  return (
    <Float speed={1.4} rotationIntensity={0.1} floatIntensity={0.22}>
      <group ref={groupRef} position={[0, -0.18, 0]}>
        <mesh receiveShadow position={[0, -0.18, 0]}>
          <cylinderGeometry args={[2.45, 2.9, 0.34, 72]} />
          <meshStandardMaterial color="#16192e" metalness={0.45} roughness={0.34} />
        </mesh>

        <mesh castShadow position={[0, 0.58, 0]}>
          <cylinderGeometry args={[1.84, 2.16, 0.98, 72]} />
          <meshStandardMaterial color="#f9cbdb" roughness={0.86} />
        </mesh>

        <mesh castShadow position={[0, 1.18, 0]}>
          <cylinderGeometry args={[1.32, 1.52, 0.74, 72]} />
          <meshStandardMaterial color="#fff7ef" roughness={0.94} />
        </mesh>

        <mesh castShadow position={[0, 1.56, 0]}>
          <cylinderGeometry args={[1.22, 1.34, 0.12, 72]} />
          <meshStandardMaterial color="#fffdf8" roughness={0.9} />
        </mesh>

        <mesh position={[0, 0.56, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.84, 0.05, 18, 120]} />
          <meshStandardMaterial color="#f6d17a" metalness={0.7} roughness={0.28} />
        </mesh>

        <IcingDrips />
        <CakeToppers />
        {children}
      </group>
    </Float>
  );
}

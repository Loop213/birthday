import { ContactShadows, Sparkles, Stars } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { gsap } from "gsap";
import { Suspense, useEffect, useMemo, useRef } from "react";

function LetterStage({ replayToken = 0, opening = false, onOpened, onOpenRequest }) {
  const groupRef = useRef(null);
  const flapRef = useRef(null);
  const paperRef = useRef(null);
  const hasCompletedRef = useRef(false);
  const entranceDirection = useMemo(() => {
    const directions = [
      [-8, 2.5, 0.5],
      [8, 1.6, 0.5],
      [0.5, 7, -1],
      [-0.8, -6, 0]
    ];

    return directions[Math.abs(replayToken) % directions.length];
  }, [replayToken]);
  const { camera } = useThree();

  useEffect(() => {
    if (!groupRef.current || !flapRef.current || !paperRef.current) {
      return;
    }

    hasCompletedRef.current = false;
    gsap.killTweensOf([groupRef.current.position, groupRef.current.rotation, groupRef.current.scale, flapRef.current.rotation, paperRef.current.position, camera.position]);

    groupRef.current.position.set(...entranceDirection);
    groupRef.current.rotation.set(0.4, -0.55, 0.22);
    groupRef.current.scale.setScalar(0.86);
    flapRef.current.rotation.x = 0;
    paperRef.current.position.set(0, 0.06, -0.01);
    camera.position.set(0, 0.5, 8.3);

    const intro = gsap.timeline();
    intro
      .to(camera.position, {
        z: 6.2,
        duration: 2.6,
        ease: "power2.out"
      })
      .to(
        groupRef.current.position,
        {
          x: 0,
          y: 0.35,
          z: 0,
          duration: 2.4,
          ease: "power3.out"
        },
        0
      )
      .to(
        groupRef.current.rotation,
        {
          x: 0.08,
          y: 0.14,
          z: -0.08,
          duration: 2.4,
          ease: "power3.out"
        },
        0
      )
      .to(
        groupRef.current.scale,
        {
          x: 1,
          y: 1,
          z: 1,
          duration: 2,
          ease: "back.out(1.4)"
        },
        0.15
      );

    return () => intro.kill();
  }, [camera.position, entranceDirection, replayToken]);

  useEffect(() => {
    if (!opening || !flapRef.current || !paperRef.current || hasCompletedRef.current) {
      return;
    }

    hasCompletedRef.current = true;
    const openTimeline = gsap.timeline({
      onComplete: () => {
        onOpened?.();
      }
    });

    openTimeline
      .to(flapRef.current.rotation, {
        x: -2.25,
        duration: 0.65,
        ease: "power2.out"
      })
      .to(
        paperRef.current.position,
        {
          y: 1.18,
          z: 0.28,
          duration: 0.9,
          ease: "power2.out"
        },
        0.12
      )
      .to(
        paperRef.current.rotation,
        {
          x: -0.08,
          duration: 0.9,
          ease: "power2.out"
        },
        0.12
      );

    return () => openTimeline.kill();
  }, [onOpened, opening]);

  useFrame((state) => {
    if (!groupRef.current) {
      return;
    }

    groupRef.current.position.y += Math.sin(state.clock.elapsedTime * 1.2) * 0.0028;
    groupRef.current.rotation.z += Math.sin(state.clock.elapsedTime * 0.9) * 0.0008;
  });

  return (
    <>
      <color attach="background" args={["#040712"]} />
      <fog attach="fog" args={["#040712", 8, 16]} />
      <ambientLight intensity={0.9} />
      <directionalLight position={[3, 6, 4]} intensity={1.2} color="#fff4df" castShadow />
      <pointLight position={[0, 1.6, 1.8]} intensity={22} color="#ff4ecd" />
      <pointLight position={[1.2, 1.1, 0.6]} intensity={12} color="#4bf4ff" />
      <Stars radius={50} depth={24} count={1800} factor={4} saturation={0} fade speed={0.7} />
      <Sparkles count={90} size={2.5} scale={8} color="#ffd7ee" speed={0.35} />

      <group ref={groupRef} onClick={() => !opening && onOpenRequest?.()}>
        <mesh position={[0, -0.02, -0.08]} receiveShadow>
          <boxGeometry args={[3.3, 2.1, 0.16]} />
          <meshStandardMaterial color="#2e173e" metalness={0.15} roughness={0.55} />
        </mesh>

        <mesh position={[0, 0.06, 0.02]} castShadow>
          <boxGeometry args={[3.18, 1.92, 0.08]} />
          <meshStandardMaterial color="#fff7ef" emissive="#ffb9dc" emissiveIntensity={0.18} />
        </mesh>

        <group ref={flapRef} position={[0, 0.96, 0.08]}>
          <mesh castShadow position={[0, -0.46, 0]}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                array={new Float32Array([
                  -1.56, -0.46, 0,
                  1.56, -0.46, 0,
                  0, 0.46, 0
                ])}
                count={3}
                itemSize={3}
              />
            </bufferGeometry>
            <meshStandardMaterial color="#f8d9e7" side={2} emissive="#ffb6d7" emissiveIntensity={0.12} />
          </mesh>
        </group>

        <mesh castShadow position={[0, -0.5, 0.1]}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              array={new Float32Array([
                -1.58, 0.5, 0,
                1.58, 0.5, 0,
                0, -0.5, 0
              ])}
              count={3}
              itemSize={3}
            />
          </bufferGeometry>
          <meshStandardMaterial color="#f1bdd4" side={2} emissive="#f58ac4" emissiveIntensity={0.08} />
        </mesh>

        <mesh castShadow position={[-0.8, 0.1, 0.1]} rotation={[0, 0, 0.58]}>
          <planeGeometry args={[1.7, 1.5]} />
          <meshStandardMaterial color="#f2c9db" side={2} emissive="#f7a8cf" emissiveIntensity={0.06} />
        </mesh>

        <mesh castShadow position={[0.8, 0.1, 0.1]} rotation={[0, 0, -0.58]}>
          <planeGeometry args={[1.7, 1.5]} />
          <meshStandardMaterial color="#f2c9db" side={2} emissive="#f7a8cf" emissiveIntensity={0.06} />
        </mesh>

        <group ref={paperRef}>
          <mesh castShadow>
            <planeGeometry args={[2.1, 2.7]} />
            <meshStandardMaterial color="#fffaf4" emissive="#ffffff" emissiveIntensity={0.12} side={2} />
          </mesh>
          <mesh position={[0, 0, -0.01]}>
            <planeGeometry args={[1.8, 2.35]} />
            <meshStandardMaterial color="#f6e9f0" side={2} />
          </mesh>
        </group>
      </group>

      <ContactShadows position={[0, -1.55, 0]} scale={7.5} blur={2.4} opacity={0.38} />
    </>
  );
}

export default function MagicLetterScene({ replayToken = 0, opening = false, onOpened, onOpenRequest }) {
  return (
    <div className="relative h-[420px] overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/60 shadow-glow sm:h-[560px]">
      <Canvas camera={{ position: [0, 0.5, 8.3], fov: 34 }} dpr={[1, 1.6]} shadows>
        <Suspense fallback={null}>
          <LetterStage
            replayToken={replayToken}
            opening={opening}
            onOpened={onOpened}
            onOpenRequest={onOpenRequest}
          />
        </Suspense>
      </Canvas>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#040712] via-[#040712]/80 to-transparent" />
    </div>
  );
}

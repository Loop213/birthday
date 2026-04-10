import { Center, Sparkles, Stars, Text3D } from "@react-three/drei";
import fontUrl from "three/examples/fonts/helvetiker_bold.typeface.json?url";

export function NameText3D({
  text,
  position = [0, 2.2, 0],
  size = 0.38,
  color = "#ffffff",
  emissive = "#4bf4ff"
}) {
  return (
    <Center position={position}>
      <Text3D
        font={fontUrl}
        size={size}
        height={0.12}
        curveSegments={12}
        bevelEnabled
        bevelThickness={0.02}
        bevelSize={0.01}
        bevelSegments={4}
      >
        {text || "Birthday Star"}
        <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={0.45} />
      </Text3D>
    </Center>
  );
}

export function SceneFloor({ color = "#081022" }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.35, 0]} receiveShadow>
      <circleGeometry args={[7, 80]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

export function SceneSparkles({ color = "#ffffff", count = 80, scale = 7 }) {
  return <Sparkles count={count} size={2.2} scale={scale} color={color} speed={0.55} />;
}

export function NightStars() {
  return <Stars radius={40} depth={30} count={1800} factor={4} saturation={0} fade speed={0.6} />;
}

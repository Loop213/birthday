import { Float, Sparkles, useTexture } from "@react-three/drei";
import { NameText3D, SceneFloor } from "./shared.jsx";

function FramedPhotos({ imageUrls }) {
  const textures = useTexture(imageUrls);

  return (
    <>
      {textures.map((texture, index) => {
        const x = (index - (textures.length - 1) / 2) * 1.8;
        const rotation = (index - 1) * 0.12;

        return (
          <group key={imageUrls[index]} position={[x, 0.6 + (index % 2) * 0.2, -0.7 - index * 0.12]} rotation={[0, rotation, 0]}>
            <mesh castShadow>
              <boxGeometry args={[1.25, 1.45, 0.08]} />
              <meshStandardMaterial color="#50321f" />
            </mesh>
            <mesh position={[0, 0, 0.05]}>
              <planeGeometry args={[1.02, 1.2]} />
              <meshBasicMaterial map={texture} toneMapped={false} />
            </mesh>
          </group>
        );
      })}
    </>
  );
}

function EmptyFrames() {
  return (
    <>
      {[-1.9, 0, 1.9].map((x, index) => (
        <group key={x} position={[x, 0.65 + (index % 2) * 0.18, -0.8]} rotation={[0, (index - 1) * 0.12, 0]}>
          <mesh castShadow>
            <boxGeometry args={[1.22, 1.4, 0.08]} />
            <meshStandardMaterial color="#5a3822" />
          </mesh>
          <mesh position={[0, 0, 0.05]}>
            <planeGeometry args={[0.98, 1.18]} />
            <meshStandardMaterial color="#f0e2c5" emissive="#ffd166" emissiveIntensity={0.06} />
          </mesh>
        </group>
      ))}
    </>
  );
}

export default function FamilyWarmthScene({ wish }) {
  const imageUrls = (wish.images || []).slice(0, 4).map((image) => image.url);

  return (
    <>
      <color attach="background" args={["#2a1b10"]} />
      <fog attach="fog" args={["#2a1b10", 9, 18]} />
      <ambientLight intensity={0.95} />
      <directionalLight position={[4, 5, 4]} intensity={1.35} color="#ffd166" castShadow />
      <pointLight position={[-3, 2, 3]} intensity={16} color="#ffbf69" />
      <pointLight position={[3, 2, 2]} intensity={10} color="#ffe8a3" />
      <NameText3D text={wish.recipientName} position={[0, 2.45, 0]} color="#fff1d6" emissive="#ffd166" />
      <mesh position={[0, 1.05, -1.65]}>
        <torusGeometry args={[2.6, 0.08, 20, 80, Math.PI]} />
        <meshStandardMaterial color="#ffcf7d" emissive="#ffd166" emissiveIntensity={0.3} />
      </mesh>
      <Float speed={1.2} rotationIntensity={0.18} floatIntensity={0.2}>
        <group position={[0, -0.2, 0]}>
          {imageUrls.length ? <FramedPhotos imageUrls={imageUrls} /> : <EmptyFrames />}
        </group>
      </Float>
      <SceneFloor color="#24160d" />
      <Sparkles count={65} size={2.2} scale={7} color="#ffd166" speed={0.45} />
    </>
  );
}

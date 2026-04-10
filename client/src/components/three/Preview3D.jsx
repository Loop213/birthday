import { Canvas } from "@react-three/fiber";
import confetti from "canvas-confetti";
import { gsap } from "gsap";
import { Suspense, useEffect, useRef, useState } from "react";
import { templateSceneMap } from "./templates/index.jsx";
import { getBirthdayTemplate } from "../../data/templates.js";

function useMobileFallbackEnabled() {
  const [isFallback, setIsFallback] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const mediaQuery = window.matchMedia("(max-width: 767px), (prefers-reduced-motion: reduce)");
    const update = () => setIsFallback(mediaQuery.matches);

    update();
    mediaQuery.addEventListener("change", update);

    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  return isFallback;
}

function MobileTemplateFallback({ wish, template }) {
  const heroImage = wish?.images?.[0]?.url;

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/70 p-6 shadow-glow">
      <div className={`absolute inset-x-0 top-0 h-36 bg-gradient-to-br ${template.halo} opacity-90`} />
      <div className="relative z-10">
        <span className="badge">{template.shortLabel}</span>
        <h3 className="mt-5 text-3xl font-semibold text-white">
          {wish?.recipientName || "Birthday Star"}
        </h3>
        <p className="mt-3 text-white/65">{template.description}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {template.features.map((feature) => (
            <span
              key={feature}
              className="rounded-full border border-white/10 bg-slate-950/70 px-3 py-1 text-xs text-white/60"
            >
              {feature}
            </span>
          ))}
        </div>
        {heroImage ? (
          <img
            src={heroImage}
            alt={wish?.recipientName || "Birthday memory"}
            className="mt-6 h-48 w-full rounded-[1.5rem] object-cover"
          />
        ) : null}
        {wish?.message ? (
          <p className="mt-6 rounded-[1.5rem] border border-white/10 bg-slate-950/65 p-4 text-sm leading-7 text-white/70">
            {wish.message}
          </p>
        ) : null}
        <p className="mt-6 text-sm text-cyan-100">{template.interactionHint}</p>
      </div>
    </div>
  );
}

export default function Preview3D({
  wish,
  className = "",
  mode = "preview",
  replayToken = 0,
  showOverlay = true,
  onPrimaryInteraction
}) {
  const template = getBirthdayTemplate(wish?.templateId);
  const SceneComponent = templateSceneMap[template.id];
  const overlayRef = useRef(null);
  const isFallback = useMobileFallbackEnabled();
  const wishIdentity = wish?._id || wish?.id || wish?.shareSlug || template.id;

  useEffect(() => {
    if (!overlayRef.current) {
      return;
    }

    gsap.fromTo(
      overlayRef.current,
      { opacity: 0, y: 26, scale: 0.98 },
      { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: "power3.out" }
    );
  }, [mode, template.id, wishIdentity]);

  function handleCelebrate(event) {
    if (event?.type === "balloon") {
      confetti({ particleCount: 48, spread: 64, origin: { y: 0.45 } });
      return;
    }

    if (event?.type === "fireworks") {
      confetti({ particleCount: 140, spread: 90, origin: { y: 0.5 } });
      return;
    }

    confetti({ particleCount: 80, spread: 74, origin: { y: 0.58 } });
  }

  if (isFallback) {
    return <MobileTemplateFallback wish={wish} template={template} />;
  }

  return (
    <div className={`relative h-[420px] overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/70 shadow-glow sm:h-[520px] ${className}`}>
      <Canvas camera={{ position: [0, 1.4, 6], fov: 44 }} shadows dpr={[1, 1.6]}>
        <Suspense fallback={null}>
          <SceneComponent
            wish={wish}
            onCelebrate={handleCelebrate}
            replayToken={replayToken}
            onPrimaryInteraction={onPrimaryInteraction}
          />
        </Suspense>
      </Canvas>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#050816] via-[#050816]/70 to-transparent" />
      {showOverlay ? (
        <div ref={overlayRef} className="pointer-events-none absolute inset-x-0 bottom-0 p-5 sm:p-6">
          <div className="inline-flex max-w-xl flex-col gap-2 rounded-[1.5rem] border border-white/10 bg-slate-950/65 px-5 py-4 backdrop-blur-xl">
            <span className="text-xs uppercase tracking-[0.28em] text-cyan-100/80">
              {template.shortLabel}
            </span>
            <p className="text-sm text-white/70">{template.interactionHint}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

import {
  Expand,
  Minimize2,
  RotateCcw,
  Volume2,
  VolumeX
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import { useEffect, useMemo, useRef, useState } from "react";
import Preview3D from "../three/Preview3D.jsx";
import { musicPresets } from "../../data/options.js";
import { defaultGalleryImages } from "../../data/defaultGallery.js";

const SCENE_DURATIONS = {
  1: 5000,
  2: 5000,
  3: 10000,
  4: 5000,
  5: 5000,
  6: 10000
};

function FloatingBackdrop() {
  const particles = useMemo(
    () =>
      Array.from({ length: 28 }, (_, index) => ({
        id: index,
        size: 6 + (index % 5) * 7,
        left: `${(index * 11) % 100}%`,
        top: `${(index * 17) % 100}%`,
        duration: 6 + (index % 6),
        delay: index * 0.12
      })),
    []
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((particle) => (
        <motion.span
          key={particle.id}
          className="absolute rounded-full bg-white/20 blur-[1px]"
          style={{
            width: particle.size,
            height: particle.size,
            left: particle.left,
            top: particle.top
          }}
          animate={{
            y: [0, -36, 0],
            x: [0, particle.id % 2 === 0 ? 10 : -10, 0],
            opacity: [0.18, 0.72, 0.18]
          }}
          transition={{
            repeat: Infinity,
            duration: particle.duration,
            delay: particle.delay,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
}

function ImageCarousel({ images, recipientName }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % images.length);
    }, 2200);

    return () => window.clearInterval(timer);
  }, [images.length]);

  return (
    <div className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_0.85fr]">
      <motion.div
        key={images[activeIndex]?.url}
        initial={{ opacity: 0, y: 18, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45 }}
        className="group overflow-hidden rounded-[1.85rem] border border-white/10 bg-white/6 shadow-glow backdrop-blur-xl"
      >
        <img
          src={images[activeIndex]?.url}
          alt={recipientName}
          className="h-[320px] w-full object-cover transition duration-500 group-hover:scale-105"
        />
      </motion.div>

      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
        {images.slice(0, 3).map((image, index) => (
          <motion.button
            key={`${image.url}-${index}`}
            type="button"
            whileHover={{ y: -4, scale: 1.01 }}
            onClick={() => setActiveIndex(index)}
            className={`overflow-hidden rounded-[1.35rem] border bg-white/6 backdrop-blur-xl ${
              index === activeIndex ? "border-cyan-300/40 shadow-glow" : "border-white/10"
            }`}
          >
            <img src={image.url} alt={`${recipientName} memory ${index + 1}`} className="h-24 w-full object-cover" />
          </motion.button>
        ))}
      </div>
    </div>
  );
}

export default function CinematicWishExperience({ wish, shareUrl = "" }) {
  const containerRef = useRef(null);
  const audioRef = useRef(null);
  const [scene, setScene] = useState(1);
  const [sceneStartedAt, setSceneStartedAt] = useState(Date.now());
  const [muted, setMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [replayToken, setReplayToken] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [interactionTriggered, setInteractionTriggered] = useState(false);
  const [clockTick, setClockTick] = useState(Date.now());
  const presetTrack = musicPresets.find((preset) => preset.value === wish?.music?.preset);
  const defaultTrack = musicPresets.find((preset) => preset.isDefault) || musicPresets[0];
  const audioSource =
    wish?.music?.type === "upload"
      ? wish?.music?.url
      : presetTrack?.url || defaultTrack?.url;
  const galleryImages = (wish?.images?.length ? wish.images : defaultGalleryImages.map((url) => ({ url }))).slice(0, 6);

  useEffect(() => {
    const handleChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener("fullscreenchange", handleChange);
    return () => document.removeEventListener("fullscreenchange", handleChange);
  }, []);

  useEffect(() => {
    setSceneStartedAt(Date.now());

    if (scene === 5) {
      confetti({ particleCount: 180, spread: 92, origin: { y: 0.45 } });
      window.setTimeout(() => {
        confetti({ particleCount: 120, spread: 120, origin: { x: 0.2, y: 0.35 } });
      }, 450);
      window.setTimeout(() => {
        confetti({ particleCount: 120, spread: 120, origin: { x: 0.8, y: 0.35 } });
      }, 800);
    }
  }, [scene]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setClockTick(Date.now());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (scene >= 6) {
      return undefined;
    }

    if (scene === 4 && interactionTriggered) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setScene((current) => Math.min(current + 1, 6));
    }, SCENE_DURATIONS[scene]);

    return () => window.clearTimeout(timer);
  }, [interactionTriggered, scene]);

  useEffect(() => {
    if (!audioRef.current || !audioSource) {
      return;
    }

    audioRef.current.muted = muted;
    audioRef.current.volume = scene >= 5 ? 0.75 : 0.4;
    audioRef.current.play().catch(() => undefined);
  }, [audioSource, muted, scene, replayToken]);

  useEffect(() => {
    if (scene !== 6) {
      setTypedText("");
      return undefined;
    }

    const message = `Happy Birthday ${wish?.recipientName || ""} ❤️`;
    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setTypedText(message.slice(0, index));
      if (index >= message.length) {
        window.clearInterval(timer);
      }
    }, 52);

    return () => window.clearInterval(timer);
  }, [scene, wish?.recipientName, replayToken]);

  const sceneCountdown = Math.max(
    1,
    Math.ceil((SCENE_DURATIONS[2] - (clockTick - sceneStartedAt)) / 1000)
  );

  function handleReplay() {
    setScene(1);
    setSceneStartedAt(Date.now());
    setReplayToken((current) => current + 1);
    setInteractionTriggered(false);
    setTypedText("");

    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => undefined);
    }
  }

  async function toggleFullscreen() {
    if (!containerRef.current) {
      return;
    }

    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }

    await containerRef.current.requestFullscreen();
  }

  function handlePrimaryInteraction() {
    if (scene !== 4) {
      return;
    }

    setInteractionTriggered(true);
    setScene(5);
  }

  function renderSceneCopy() {
    switch (scene) {
      case 1:
        return (
          <motion.div key="scene-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <p className="text-sm uppercase tracking-[0.32em] text-cyan-100/75">Scene 1</p>
            <h1 className="mt-6 max-w-4xl text-5xl font-semibold leading-tight text-white sm:text-6xl">
              Someone has something special for you
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/68">
              Stay with the moment. This birthday story is about to unfold like a personal film.
            </p>
          </motion.div>
        );
      case 2:
        return (
          <motion.div key="scene-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <p className="text-sm uppercase tracking-[0.32em] text-fuchsia-100/80">Scene 2</p>
            <div className="mt-8 flex items-end gap-4">
              <span className="text-8xl font-semibold text-white drop-shadow-[0_0_32px_rgba(236,72,153,0.38)]">
                {sceneCountdown}
              </span>
              <span className="pb-5 text-2xl text-white/70">seconds</span>
            </div>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/68">
              The lights dim, the stars drift, and the birthday surprise moves closer.
            </p>
          </motion.div>
        );
      case 3:
        return (
          <motion.div key="scene-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <p className="text-sm uppercase tracking-[0.32em] text-amber-100/80">Scene 3</p>
            <h2 className="mt-6 text-4xl font-semibold text-white sm:text-5xl">The cake reveal</h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/68">
              Candlelight flickers, the camera glides in, and the celebration finally takes center stage.
            </p>
          </motion.div>
        );
      case 4:
        return (
          <motion.div key="scene-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <p className="text-sm uppercase tracking-[0.32em] text-white/75">Scene 4</p>
            <h2 className="mt-6 text-4xl font-semibold text-white sm:text-5xl">Tap to blow the candles</h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/68">
              One touch changes everything. Blow out the candles and trigger the birthday magic.
            </p>
          </motion.div>
        );
      case 5:
        return (
          <motion.div key="scene-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <p className="text-sm uppercase tracking-[0.32em] text-emerald-100/80">Scene 5</p>
            <h2 className="mt-6 text-4xl font-semibold text-white sm:text-5xl">Let the celebration explode</h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/68">
              Confetti bursts, fireworks rise, and the soundtrack lifts into party mode.
            </p>
          </motion.div>
        );
      default:
        return (
          <motion.div key="scene-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <p className="text-sm uppercase tracking-[0.32em] text-rose-100/80">Scene 6</p>
            <h2 className="mt-6 text-4xl font-semibold text-white sm:text-5xl">{typedText}</h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/68">
              For your {wish?.relation?.toLowerCase() || "special person"}, wrapped in memories, motion, and music.
            </p>
            <ImageCarousel images={galleryImages} recipientName={wish?.recipientName || "Birthday memory"} />
          </motion.div>
        );
    }
  }

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#5b21b633,transparent_24%),radial-gradient(circle_at_right,#ec489933,transparent_22%),radial-gradient(circle_at_bottom,#0ea5e93333,transparent_26%),linear-gradient(135deg,#02040d,#12081f,#08142d)]"
    >
      <FloatingBackdrop />

      {audioSource ? (
        <audio ref={audioRef} autoPlay loop className="hidden">
          <source src={audioSource} />
        </audio>
      ) : null}

      <div className="absolute right-4 top-4 z-30 flex flex-wrap gap-3 sm:right-6 sm:top-6">
        <button type="button" onClick={() => setMuted((current) => !current)} className="button-secondary">
          {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          {muted ? "Unmute" : "Mute"}
        </button>
        <button type="button" onClick={handleReplay} className="button-secondary">
          <RotateCcw className="h-4 w-4" />
          Replay
        </button>
        <button type="button" onClick={toggleFullscreen} className="button-secondary">
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Expand className="h-4 w-4" />}
          {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
        </button>
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-4 py-8 sm:px-6 lg:px-8">
        <motion.div
          animate={{ opacity: scene >= 3 ? 1 : 0.38, scale: scene >= 3 ? 1 : 1.06, filter: scene >= 3 ? "blur(0px)" : "blur(3px)" }}
          transition={{ duration: 1.1, ease: "easeOut" }}
          className="absolute inset-0 z-0"
        >
          <Preview3D
            wish={wish}
            mode="public"
            replayToken={replayToken}
            showOverlay={false}
            className="h-full min-h-screen rounded-none border-0 bg-transparent shadow-none"
            onPrimaryInteraction={handlePrimaryInteraction}
          />
        </motion.div>

        <div className="relative z-20 grid min-h-screen items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="glass-panel border-white/12 bg-slate-950/38 p-8 shadow-glow backdrop-blur-2xl sm:p-10">
            <AnimatePresence mode="wait">
              {renderSceneCopy()}
            </AnimatePresence>

            <div className="mt-10 flex flex-wrap gap-3">
              <span className="rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm text-white/65">
                Personalized for {wish?.recipientName}
              </span>
              <span className="rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm text-white/65">
                {wish?.relation}
              </span>
              {shareUrl ? (
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`A birthday surprise is ready: ${shareUrl}`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-100"
                >
                  Share
                </a>
              ) : null}
            </div>
          </div>

          <div className="hidden lg:block" />
        </div>
      </div>
    </div>
  );
}

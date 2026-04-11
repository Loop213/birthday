import {
  Expand,
  Globe,
  Instagram,
  Linkedin,
  Mail,
  Minimize2,
  RotateCcw,
  Volume2,
  VolumeX
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import { useEffect, useMemo, useRef, useState } from "react";
import Preview3D from "../three/Preview3D.jsx";
import MagicLetterScene from "../three/MagicLetterScene.jsx";
import { musicPresets } from "../../data/options.js";
import { defaultGalleryImages } from "../../data/defaultGallery.js";
import { getBirthdayTemplate } from "../../data/templates.js";
import { playPaperOpenSound } from "../../utils/soundEffects.js";

const STORY_STAGES = {
  LETTER: "letter",
  SHAYARI: "shayari",
  MESSAGE: "message",
  PHOTOS: "photos",
  CELEBRATION: "celebration"
};

const STAGE_TIMINGS = {
  shayari: 6500,
  message: 6500,
  photos: 8500
};

function FloatingBackdrop() {
  const particles = useMemo(
    () =>
      Array.from({ length: 34 }, (_, index) => ({
        id: index,
        size: 4 + (index % 5) * 7,
        left: `${(index * 9) % 100}%`,
        top: `${(index * 13) % 100}%`,
        duration: 6 + (index % 6),
        delay: index * 0.14
      })),
    []
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((particle) => (
        <motion.span
          key={particle.id}
          className="absolute rounded-full bg-white/25 blur-[1px]"
          style={{
            width: particle.size,
            height: particle.size,
            left: particle.left,
            top: particle.top
          }}
          animate={{
            y: [0, -38, 0],
            x: [0, particle.id % 2 === 0 ? 12 : -12, 0],
            opacity: [0.12, 0.7, 0.12]
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

function TypewrittenText({ text, active, speed = 48, className = "" }) {
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    if (!active) {
      setDisplayText("");
      return undefined;
    }

    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setDisplayText(text.slice(0, index));

      if (index >= text.length) {
        window.clearInterval(timer);
      }
    }, speed);

    return () => window.clearInterval(timer);
  }, [active, speed, text]);

  return (
    <div className={className}>
      {displayText}
      {active ? <span className="ml-1 inline-block h-5 w-1 animate-pulse rounded-full bg-cyan-200 align-middle" /> : null}
    </div>
  );
}

function ImageCarousel({ images, recipientName }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [images]);

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
    <div className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.12fr)_0.88fr]">
      <motion.div
        key={images[activeIndex]?.url}
        initial={{ opacity: 0, y: 18, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45 }}
        className="group overflow-hidden rounded-[1.85rem] border border-fuchsia-300/15 bg-white/6 shadow-glow backdrop-blur-xl"
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
              index === activeIndex
                ? "border-cyan-300/45 shadow-glow"
                : "border-white/10"
            }`}
          >
            <img
              src={image.url}
              alt={`${recipientName} memory ${index + 1}`}
              className="h-24 w-full object-cover"
            />
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function FooterBranding() {
  const links = [
    { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
    { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
    { icon: Mail, href: "mailto:hello@birthdayglow.com", label: "Gmail" },
    { icon: Globe, href: "https://birthdayglow.com", label: "Website" }
  ];

  return (
    <footer className="relative z-20 border-t border-white/10 bg-slate-950/35 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div>
          <p className="text-lg font-semibold text-white">Birthday Glow</p>
          <p className="text-sm text-white/55">Made with ❤️ by Birthday Glow</p>
        </div>

        <div className="flex flex-wrap gap-3">
          {links.map(({ icon: Icon, href, label }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith("mailto:") ? undefined : "_blank"}
              rel={href.startsWith("mailto:") ? undefined : "noreferrer"}
              className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/6 text-white/75 transition hover:border-cyan-300/30 hover:bg-cyan-300/10 hover:text-cyan-100 hover:shadow-glow"
              aria-label={label}
            >
              <Icon className="h-5 w-5" />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}

export default function CinematicWishExperience({ wish, shareUrl = "" }) {
  const containerRef = useRef(null);
  const audioRef = useRef(null);
  const template = getBirthdayTemplate(wish?.templateId);
  const [stage, setStage] = useState(STORY_STAGES.LETTER);
  const [muted, setMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [replayToken, setReplayToken] = useState(0);
  const [letterOpening, setLetterOpening] = useState(false);
  const [celebrationTriggered, setCelebrationTriggered] = useState(false);
  const presetTrack = musicPresets.find((preset) => preset.value === wish?.music?.preset);
  const defaultTrack = musicPresets.find((preset) => preset.isDefault) || musicPresets[0];
  const audioSource =
    wish?.music?.type === "upload"
      ? wish?.music?.url
      : presetTrack?.url || defaultTrack?.url;
  const galleryImages = (wish?.images?.length
    ? wish.images
    : defaultGalleryImages.map((url) => ({ url }))).slice(0, 6);
  const shayariText =
    wish?.shayari?.trim() || "Har pal tujhse juda rehna mushkil hai, phir bhi har dua mein tera naam shamil hai.";
  const mainMessage =
    wish?.message?.trim() || `Happy Birthday ❤️ ${wish?.recipientName}, you are my world.`;

  useEffect(() => {
    const handleChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener("fullscreenchange", handleChange);
    return () => document.removeEventListener("fullscreenchange", handleChange);
  }, []);

  useEffect(() => {
    const autoOpenTimer = window.setTimeout(() => {
      if (stage === STORY_STAGES.LETTER && !letterOpening) {
        setLetterOpening(true);
        playPaperOpenSound();
      }
    }, 2000);

    return () => window.clearTimeout(autoOpenTimer);
  }, [letterOpening, replayToken, stage]);

  useEffect(() => {
    if (stage === STORY_STAGES.CELEBRATION && !celebrationTriggered) {
      setCelebrationTriggered(true);
      confetti({ particleCount: 180, spread: 92, origin: { y: 0.45 } });
      window.setTimeout(() => {
        confetti({ particleCount: 120, spread: 120, origin: { x: 0.2, y: 0.35 } });
      }, 450);
      window.setTimeout(() => {
        confetti({ particleCount: 120, spread: 120, origin: { x: 0.8, y: 0.35 } });
      }, 800);
    }
  }, [celebrationTriggered, stage]);

  useEffect(() => {
    let timer;

    if (stage === STORY_STAGES.SHAYARI) {
      timer = window.setTimeout(() => setStage(STORY_STAGES.MESSAGE), STAGE_TIMINGS.shayari);
    } else if (stage === STORY_STAGES.MESSAGE) {
      timer = window.setTimeout(() => setStage(STORY_STAGES.PHOTOS), STAGE_TIMINGS.message);
    } else if (stage === STORY_STAGES.PHOTOS) {
      timer = window.setTimeout(() => setStage(STORY_STAGES.CELEBRATION), STAGE_TIMINGS.photos);
    }

    return () => window.clearTimeout(timer);
  }, [stage]);

  useEffect(() => {
    if (!audioRef.current || !audioSource) {
      return;
    }

    audioRef.current.muted = muted;
    audioRef.current.volume = stage === STORY_STAGES.CELEBRATION ? 0.8 : 0.45;
    audioRef.current.play().catch(() => undefined);
  }, [audioSource, muted, replayToken, stage]);

  function startOpening() {
    if (letterOpening) {
      return;
    }

    setLetterOpening(true);
    playPaperOpenSound();
  }

  function handleLetterOpened() {
    setStage(STORY_STAGES.SHAYARI);
  }

  function handleReplay() {
    setStage(STORY_STAGES.LETTER);
    setReplayToken((current) => current + 1);
    setLetterOpening(false);
    setCelebrationTriggered(false);

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

  const stageTitle = {
    [STORY_STAGES.LETTER]: "A magical letter is on its way",
    [STORY_STAGES.SHAYARI]: "A few lines from the heart",
    [STORY_STAGES.MESSAGE]: "The real surprise begins here",
    [STORY_STAGES.PHOTOS]: "Memories that deserve a spotlight",
    [STORY_STAGES.CELEBRATION]: `${template.shortLabel} finale`
  }[stage];

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

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid min-h-[calc(100vh-6rem)] items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="order-2 lg:order-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={stage}
                initial={{ opacity: 0, y: 26, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -18, scale: 0.98 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="glass-panel border-white/12 bg-slate-950/40 p-8 shadow-glow backdrop-blur-2xl sm:p-10"
              >
                <span className="badge">{stageTitle}</span>

                {stage === STORY_STAGES.LETTER ? (
                  <>
                    <h1 className="mt-6 text-5xl font-semibold leading-tight text-white sm:text-6xl">
                      Someone sent you a surprise wrapped like a love letter
                    </h1>
                    <p className="mt-5 max-w-2xl text-lg leading-8 text-white/68">
                      Watch the envelope float in. Tap to open it now, or let the magic reveal itself in a moment.
                    </p>
                    <p className="mt-8 text-sm uppercase tracking-[0.32em] text-fuchsia-100/80">
                      Tap to open your surprise 💌
                    </p>
                  </>
                ) : null}

                {stage === STORY_STAGES.SHAYARI ? (
                  <>
                    <p className="mt-8 text-sm uppercase tracking-[0.32em] text-fuchsia-100/80">Shayari</p>
                    <TypewrittenText
                      active
                      text={shayariText}
                      speed={60}
                      className="mt-6 max-w-3xl text-3xl font-medium italic leading-[1.5] text-rose-50 drop-shadow-[0_0_22px_rgba(255,78,205,0.2)] sm:text-4xl"
                    />
                  </>
                ) : null}

                {stage === STORY_STAGES.MESSAGE ? (
                  <>
                    <p className="mt-8 text-sm uppercase tracking-[0.32em] text-cyan-100/80">Message</p>
                    <TypewrittenText
                      active
                      text={mainMessage}
                      speed={42}
                      className="mt-6 max-w-3xl text-4xl font-semibold leading-[1.35] text-white sm:text-5xl"
                    />
                    <p className="mt-6 text-lg text-white/65">
                      For your {wish?.relation?.toLowerCase() || "special person"}, from a heart that wanted this moment to feel unforgettable.
                    </p>
                  </>
                ) : null}

                {stage === STORY_STAGES.PHOTOS ? (
                  <>
                    <p className="mt-8 text-sm uppercase tracking-[0.32em] text-amber-100/80">Photos</p>
                    <h2 className="mt-6 text-4xl font-semibold text-white sm:text-5xl">
                      Little frames, big feelings
                    </h2>
                    <p className="mt-5 max-w-2xl text-lg leading-8 text-white/68">
                      Up to six memories drift into view, one after another, like pages from a personal reel.
                    </p>
                    <ImageCarousel images={galleryImages} recipientName={wish?.recipientName || "Birthday memory"} />
                  </>
                ) : null}

                {stage === STORY_STAGES.CELEBRATION ? (
                  <>
                    <p className="mt-8 text-sm uppercase tracking-[0.32em] text-emerald-100/80">Celebration</p>
                    <h2 className="mt-6 text-4xl font-semibold text-white sm:text-5xl">
                      The story ends in celebration
                    </h2>
                    <p className="mt-5 max-w-2xl text-lg leading-8 text-white/68">
                      The cake, candles, music, confetti, and fireworks bring everything together. Tap the scene to keep the magic moving.
                    </p>
                    <div className="mt-8 flex flex-wrap gap-3">
                      <span className="rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm text-white/70">
                        Personalized for {wish?.recipientName}
                      </span>
                      <span className="rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm text-white/70">
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
                  </>
                ) : null}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="order-1 lg:order-2">
            {stage === STORY_STAGES.LETTER ? (
              <MagicLetterScene
                replayToken={replayToken}
                opening={letterOpening}
                onOpened={handleLetterOpened}
                onOpenRequest={startOpening}
              />
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
              >
                <Preview3D
                  wish={wish}
                  mode="public"
                  replayToken={replayToken}
                  showOverlay={stage === STORY_STAGES.CELEBRATION}
                  className="min-h-[420px] sm:min-h-[560px]"
                />
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <FooterBranding />
    </div>
  );
}

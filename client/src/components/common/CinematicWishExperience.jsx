import {
  ChevronUp,
  Expand,
  Globe,
  Instagram,
  Linkedin,
  Mail,
  Minimize2,
  Music4,
  RotateCcw,
  Volume2,
  VolumeX
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import { useEffect, useMemo, useRef, useState } from "react";
import MagicLetterScene from "../three/MagicLetterScene.jsx";
import Preview3D from "../three/Preview3D.jsx";
import AudioControlBar from "./AudioControlBar.jsx";
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
  shayari: 36000,
  message: 7000,
  photos: 9000
};

const STAGE_SEQUENCE = [
  STORY_STAGES.LETTER,
  STORY_STAGES.SHAYARI,
  STORY_STAGES.MESSAGE,
  STORY_STAGES.PHOTOS,
  STORY_STAGES.CELEBRATION
];

function FloatingBackdrop() {
  const particles = useMemo(
    () =>
      Array.from({ length: 44 }, (_, index) => ({
        id: index,
        size: 3 + (index % 6) * 6,
        left: `${(index * 7.7) % 100}%`,
        top: `${(index * 11.4) % 100}%`,
        duration: 7 + (index % 7),
        delay: index * 0.12
      })),
    []
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#8b5cf633,transparent_26%),radial-gradient(circle_at_80%_10%,#ec489944,transparent_24%),radial-gradient(circle_at_bottom,#38bdf833,transparent_32%),linear-gradient(135deg,#02040d,#10081e,#071326)]" />
      {particles.map((particle) => (
        <motion.span
          key={particle.id}
          className="absolute rounded-full bg-white/30 blur-[1px]"
          style={{
            width: particle.size,
            height: particle.size,
            left: particle.left,
            top: particle.top
          }}
          animate={{
            x: [0, particle.id % 2 === 0 ? 18 : -18, 0],
            y: [0, -40, 0],
            opacity: [0.15, 0.8, 0.15],
            scale: [0.8, 1.15, 0.8]
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

function splitShayari(shayari) {
  const clean = (shayari || "").trim();

  if (!clean) {
    return [
      "Har dua me tera naam saja rehta hai,",
      "har khushi me tera hi chehra dikhta hai.",
      "Aaj ke din bas itni si tamanna hai,",
      "tera har birthday pyaar se chamakta rahe."
    ];
  }

  const newlineLines = clean
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (newlineLines.length > 1) {
    return newlineLines.slice(0, 6);
  }

  const sentenceLines = clean
    .split(/(?<=[.!?।])/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (sentenceLines.length > 1) {
    return sentenceLines.slice(0, 6);
  }

  const words = clean.split(/\s+/);
  const chunkSize = Math.max(5, Math.ceil(words.length / 4));
  const chunks = [];

  for (let index = 0; index < words.length; index += chunkSize) {
    chunks.push(words.slice(index, index + chunkSize).join(" "));
  }

  return chunks.slice(0, 6);
}

function TypewriterLines({ lines, active, duration = STAGE_TIMINGS.shayari }) {
  const [displayed, setDisplayed] = useState(() => lines.map(() => ""));
  const [cursorLine, setCursorLine] = useState(0);

  useEffect(() => {
    setDisplayed(lines.map(() => ""));
    setCursorLine(0);
  }, [lines]);

  useEffect(() => {
    if (!active || !lines.length) {
      setDisplayed(lines.map(() => ""));
      setCursorLine(0);
      return undefined;
    }

    const totalCharacters = lines.join("").length || 1;
    const msPerCharacter = Math.max(42, Math.floor(duration / totalCharacters));
    let lineIndex = 0;
    let charIndex = 0;

    const timer = window.setInterval(() => {
      setDisplayed((current) => {
        const next = [...current];
        const line = lines[lineIndex] || "";
        next[lineIndex] = line.slice(0, charIndex + 1);
        return next;
      });

      charIndex += 1;
      setCursorLine(lineIndex);

      if (charIndex >= (lines[lineIndex] || "").length) {
        lineIndex += 1;
        charIndex = 0;
        setCursorLine((current) => Math.min(current + 1, lines.length - 1));
      }

      if (lineIndex >= lines.length) {
        window.clearInterval(timer);
      }
    }, msPerCharacter);

    return () => window.clearInterval(timer);
  }, [active, duration, lines]);

  return (
    <div className="space-y-4 sm:space-y-5">
      {lines.map((line, index) => {
        const hasCursor = active && cursorLine === index && displayed[index] !== line;
        const revealed = displayed[index];

        return (
          <motion.p
            key={`${index}-${line}`}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: revealed ? 1 : 0.2, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-lg italic leading-[1.95] text-rose-50/95 drop-shadow-[0_0_18px_rgba(244,114,182,0.3)] sm:text-2xl lg:text-3xl"
          >
            {revealed}
            {hasCursor ? (
              <span className="ml-2 inline-block h-6 w-1 animate-pulse rounded-full bg-cyan-200 align-middle shadow-[0_0_16px_rgba(103,232,249,0.85)]" />
            ) : null}
          </motion.p>
        );
      })}
    </div>
  );
}

function FinaleMessage({ title, caption, active }) {
  const [displayTitle, setDisplayTitle] = useState("");
  const [displayCaption, setDisplayCaption] = useState("");

  useEffect(() => {
    if (!active) {
      setDisplayTitle("");
      setDisplayCaption("");
      return undefined;
    }

    let titleIndex = 0;
    let captionIndex = 0;
    let captionTimer;

    const titleTimer = window.setInterval(() => {
      titleIndex += 1;
      setDisplayTitle(title.slice(0, titleIndex));

      if (titleIndex >= title.length) {
        window.clearInterval(titleTimer);

        captionTimer = window.setInterval(() => {
          captionIndex += 1;
          setDisplayCaption(caption.slice(0, captionIndex));

          if (captionIndex >= caption.length) {
            window.clearInterval(captionTimer);
          }
        }, 24);
      }
    }, 36);

    return () => {
      window.clearInterval(titleTimer);
      if (captionTimer) {
        window.clearInterval(captionTimer);
      }
    };
  }, [active, caption, title]);

  return (
    <motion.div
      animate={{ y: [0, -6, 0], opacity: [0.92, 1, 0.92] }}
      transition={{ repeat: Infinity, duration: 4.8, ease: "easeInOut" }}
    >
      <h3 className="mt-3 text-2xl font-semibold leading-tight text-white drop-shadow-[0_0_26px_rgba(244,114,182,0.24)] sm:text-4xl">
        {displayTitle}
        {displayTitle.length < title.length ? (
          <span className="ml-2 inline-block h-6 w-1 animate-pulse rounded-full bg-cyan-200 align-middle" />
        ) : null}
      </h3>
      <p className="mt-4 max-w-lg text-base leading-7 text-white/72 sm:text-lg">
        {displayCaption}
      </p>
    </motion.div>
  );
}

function FloatingPhotos({ images, recipientName, active }) {
  const placements = useMemo(
    () =>
      images.map((image, index) => ({
        ...image,
        id: `${image.url}-${index}`,
        top: 8 + ((index * 13) % 68),
        left: 4 + ((index * 17) % 72),
        rotate: (index % 2 === 0 ? -1 : 1) * (6 + index * 1.8),
        width: 220 + (index % 3) * 36,
        delay: index * 0.45,
        duration: 7 + (index % 4)
      })),
    [images]
  );

  return (
    <div className="absolute inset-0 overflow-hidden">
      {placements.map((image, index) => (
        <motion.div
          key={image.id}
          initial={{ opacity: 0, scale: 0.72, x: index % 2 === 0 ? -140 : 140, y: 80 }}
          animate={
            active
              ? {
                  opacity: 1,
                  scale: [1, 1.08, 1],
                  x: [0, index % 2 === 0 ? 32 : -32, 0],
                  y: [0, -24, 10, 0],
                  rotate: [image.rotate, image.rotate + 2.5, image.rotate]
                }
              : { opacity: 0 }
          }
          transition={{
            opacity: { duration: 0.7, delay: image.delay },
            default: {
              repeat: Infinity,
              duration: image.duration,
              ease: "easeInOut",
              delay: image.delay
            }
          }}
          className="absolute"
          style={{
            top: `${image.top}%`,
            left: `${image.left}%`,
            width: `${image.width}px`
          }}
        >
          <div className="group overflow-hidden rounded-[2rem] border border-white/20 bg-white/10 p-2 shadow-[0_0_40px_rgba(168,85,247,0.25)] backdrop-blur-xl">
            <img
              src={image.url}
              alt={`${recipientName} memory ${index + 1}`}
            className="h-52 w-full rounded-[1.5rem] object-cover opacity-90 blur-[0.2px] transition duration-700 group-hover:scale-110 group-hover:opacity-100"
            />
          </div>
        </motion.div>
      ))}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(2,6,23,0.45)_70%,rgba(2,6,23,0.85)_100%)]" />
    </div>
  );
}

function FooterBranding() {
  const links = [
    { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
    { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
    { icon: Mail, href: "mailto:hello@ballwish.com", label: "Gmail" },
    { icon: Globe, href: "https://ballwish.com", label: "Website" }
  ];

  return (
    <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/45 px-4 py-2 backdrop-blur-xl">
      <span className="text-xs uppercase tracking-[0.28em] text-white/55">BALL</span>
      <span className="hidden text-sm text-white/55 sm:inline">Made with ❤️ by BALL</span>
      <div className="ml-1 flex items-center gap-2">
        {links.map(({ icon: Icon, href, label }) => (
          <a
            key={label}
            href={href}
            target={href.startsWith("mailto:") ? undefined : "_blank"}
            rel={href.startsWith("mailto:") ? undefined : "noreferrer"}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/6 text-white/70 transition hover:border-cyan-300/35 hover:bg-cyan-300/10 hover:text-cyan-100 hover:shadow-glow"
            aria-label={label}
          >
            <Icon className="h-4 w-4" />
          </a>
        ))}
      </div>
    </div>
  );
}

export default function CinematicWishExperience({ wish, shareUrl = "" }) {
  const containerRef = useRef(null);
  const template = getBirthdayTemplate(wish?.templateId);
  const galleryImages = (wish?.images?.length
    ? wish.images
    : defaultGalleryImages.map((url) => ({ url }))).slice(0, 6);
  const shayariLines = useMemo(() => splitShayari(wish?.shayari), [wish?.shayari]);
  const recipientName = wish?.recipientName || "Birthday Star";
  const relation = wish?.relation || "family";
  const highlightedMessage = `🎂 Happy Birthday ${recipientName} 🎂`;
  const subMessage = wish?.message?.trim() || "Tu sirf dost nahi, family hai ❤️";
  const finaleMessage = wish?.message?.trim() || `${recipientName}, aaj ka din sirf tumhari smile ke naam.`;
  const finaleCaption = wish?.shayari?.trim() || `Tum sirf ${relation} nahi ho, meri duniya ka sabse pyara hissa ho.`;
  const [stage, setStage] = useState(STORY_STAGES.LETTER);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [replayToken, setReplayToken] = useState(0);
  const [letterOpening, setLetterOpening] = useState(false);
  const [celebrationTriggered, setCelebrationTriggered] = useState(false);
  const [muted, setMuted] = useState(false);
  const [audioExpanded, setAudioExpanded] = useState(false);
  const activeStageIndex = STAGE_SEQUENCE.indexOf(stage);
  const activeStageLabel = {
    [STORY_STAGES.LETTER]: "Arrival",
    [STORY_STAGES.SHAYARI]: "Shayari",
    [STORY_STAGES.MESSAGE]: "Message",
    [STORY_STAGES.PHOTOS]: "Memories",
    [STORY_STAGES.CELEBRATION]: "Finale"
  }[stage];

  useEffect(() => {
    const handleChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener("fullscreenchange", handleChange);
    return () => document.removeEventListener("fullscreenchange", handleChange);
  }, []);

  useEffect(() => {
    if (stage !== STORY_STAGES.LETTER || letterOpening) {
      return undefined;
    }

    const autoOpenTimer = window.setTimeout(() => {
      setLetterOpening(true);
      playPaperOpenSound();
    }, 2200);

    return () => window.clearTimeout(autoOpenTimer);
  }, [letterOpening, replayToken, stage]);

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
    if (stage !== STORY_STAGES.MESSAGE) {
      return;
    }

    confetti({ particleCount: 140, spread: 76, origin: { y: 0.55 } });
  }, [stage]);

  useEffect(() => {
    if (stage === STORY_STAGES.CELEBRATION && !celebrationTriggered) {
      setCelebrationTriggered(true);
      confetti({ particleCount: 200, spread: 96, origin: { y: 0.42 } });
      window.setTimeout(() => {
        confetti({ particleCount: 120, spread: 120, origin: { x: 0.18, y: 0.32 } });
      }, 400);
      window.setTimeout(() => {
        confetti({ particleCount: 120, spread: 120, origin: { x: 0.82, y: 0.32 } });
      }, 720);
    }
  }, [celebrationTriggered, stage]);

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
    setAudioExpanded(false);
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

  return (
    <div ref={containerRef} className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <FloatingBackdrop />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(15,23,42,0)_38%,rgba(2,6,23,0.65)_76%,rgba(2,6,23,0.95)_100%)]" />

      <div className="absolute right-4 top-4 z-40 flex flex-wrap justify-end gap-3 sm:right-6 sm:top-6">
        <button
          type="button"
          onClick={() => setMuted((current) => !current)}
          className="button-secondary"
        >
          {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          {muted ? "Unmute" : "Mute"}
        </button>
        <button type="button" onClick={handleReplay} className="button-secondary">
          <RotateCcw className="h-4 w-4" />
          Replay
        </button>
        <button type="button" onClick={toggleFullscreen} className="button-secondary">
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Expand className="h-4 w-4" />}
          {isFullscreen ? "Exit" : "Fullscreen"}
        </button>
      </div>

      <div className="pointer-events-none absolute left-4 top-4 z-40 sm:left-6 sm:top-6">
        <div className="rounded-full border border-cyan-300/18 bg-slate-950/50 px-4 py-2 backdrop-blur-xl">
          <span className="text-xs uppercase tracking-[0.34em] text-cyan-100/80">BALL Experience</span>
        </div>
      </div>

      <div className="pointer-events-none absolute left-4 top-20 z-40 hidden sm:block sm:left-6">
        <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/35 px-4 py-4 backdrop-blur-xl">
          <p className="text-[11px] uppercase tracking-[0.3em] text-white/45">Story Flow</p>
          <div className="mt-4 flex flex-col gap-2">
            {STAGE_SEQUENCE.map((stageName, index) => (
              <div key={stageName} className="flex items-center gap-3">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    index <= activeStageIndex ? "bg-cyan-200 shadow-[0_0_14px_rgba(103,232,249,0.8)]" : "bg-white/18"
                  }`}
                />
                <span className={`text-sm ${index === activeStageIndex ? "text-white" : "text-white/45"}`}>
                  {{
                    [STORY_STAGES.LETTER]: "Arrival",
                    [STORY_STAGES.SHAYARI]: "Shayari",
                    [STORY_STAGES.MESSAGE]: "Message",
                    [STORY_STAGES.PHOTOS]: "Memories",
                    [STORY_STAGES.CELEBRATION]: "Finale"
                  }[stageName]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {stage === STORY_STAGES.LETTER ? (
          <motion.div
            key="letter-stage"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9 }}
            className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12"
          >
            <div className="absolute inset-0">
              <MagicLetterScene
                replayToken={replayToken}
                opening={letterOpening}
                onOpened={handleLetterOpened}
                onOpenRequest={startOpening}
                className="h-[100svh] rounded-none border-0 bg-transparent shadow-none"
              />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.75 }}
              className="pointer-events-none relative z-10 mx-auto max-w-4xl text-center"
            >
              <p className="text-sm uppercase tracking-[0.48em] text-white/60">A surprise is arriving</p>
              <h1 className="mt-5 text-4xl font-semibold leading-tight text-white drop-shadow-[0_0_28px_rgba(236,72,153,0.35)] sm:text-6xl">
                Someone has wrapped a little magic for you
              </h1>
              <p className="mt-6 text-base text-white/70 sm:text-lg">
                Tap to open your surprise 💌
              </p>
            </motion.div>
          </motion.div>
        ) : null}

        {stage === STORY_STAGES.SHAYARI ? (
          <motion.section
            key="shayari-stage"
            initial={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.98, filter: "blur(8px)" }}
            transition={{ duration: 0.9 }}
            className="relative z-10 flex min-h-screen items-center justify-center px-5 py-20"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.16),transparent_30%),radial-gradient(circle_at_bottom,rgba(236,72,153,0.18),transparent_34%)]" />
            <div className="relative grid w-full max-w-7xl items-center gap-8 rounded-[2.5rem] border border-white/12 bg-white/8 px-6 py-8 shadow-[0_0_65px_rgba(168,85,247,0.18)] backdrop-blur-2xl sm:px-8 sm:py-10 lg:grid-cols-[0.95fr_1.05fr] lg:px-12">
              <div className="relative z-10">
                <p className="text-left text-sm uppercase tracking-[0.46em] text-fuchsia-100/70">Shayari</p>
                <div className="mt-8 max-w-2xl">
                  <TypewriterLines lines={shayariLines} active duration={STAGE_TIMINGS.shayari} />
                </div>
              </div>

              <div className="relative min-h-[320px]">
                <FloatingPhotos images={galleryImages.slice(0, 3)} recipientName={recipientName} active />
                <motion.div
                  animate={{ y: [0, -10, 0], scale: [1, 1.015, 1] }}
                  transition={{ repeat: Infinity, duration: 5.5, ease: "easeInOut" }}
                  className="relative z-10 mx-auto w-full max-w-3xl pt-6 lg:pt-0"
                >
                  <Preview3D
                    wish={wish}
                    mode="public"
                    replayToken={replayToken}
                    showOverlay={false}
                    className="h-[320px] border-white/14 bg-slate-950/40 shadow-[0_0_60px_rgba(34,211,238,0.12)] sm:h-[380px]"
                  />
                </motion.div>
              </div>
            </div>
          </motion.section>
        ) : null}

        {stage === STORY_STAGES.MESSAGE ? (
          <motion.section
            key="message-stage"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.04 }}
            transition={{ duration: 0.75 }}
            className="relative z-10 flex min-h-screen items-center justify-center px-5 py-20"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(236,72,153,0.2),transparent_28%),radial-gradient(circle_at_center,rgba(34,211,238,0.14),transparent_54%)]" />
            <motion.div
              animate={{ scale: [1, 1.03, 1], opacity: [0.92, 1, 0.92], y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 3.8, ease: "easeInOut" }}
              className="relative mx-auto max-w-5xl text-center"
            >
              <p className="text-sm uppercase tracking-[0.46em] text-amber-100/75">For your {relation}</p>
              <h2 className="mt-7 text-4xl font-semibold leading-tight text-white drop-shadow-[0_0_40px_rgba(103,232,249,0.32)] sm:text-6xl lg:text-7xl">
                {highlightedMessage}
              </h2>
              <p className="mt-8 text-2xl font-medium text-rose-100/95 drop-shadow-[0_0_24px_rgba(244,114,182,0.28)] sm:text-4xl">
                {subMessage}
              </p>
            </motion.div>
          </motion.section>
        ) : null}

        {stage === STORY_STAGES.PHOTOS ? (
          <motion.section
            key="photos-stage"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="relative z-10 min-h-screen"
          >
            <FloatingPhotos images={galleryImages} recipientName={recipientName} active />
            <div className="relative z-10 flex min-h-screen items-end justify-center px-5 pb-32 pt-20">
              <div className="rounded-[2rem] border border-white/12 bg-slate-950/35 px-6 py-5 text-center backdrop-blur-xl">
                <p className="text-sm uppercase tracking-[0.36em] text-cyan-100/75">Memories in motion</p>
                <p className="mt-3 text-lg text-white/72 sm:text-xl">
                  Every frame carries a little more of the story.
                </p>
              </div>
            </div>
          </motion.section>
        ) : null}

        {stage === STORY_STAGES.CELEBRATION ? (
          <motion.section
            key="celebration-stage"
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9 }}
            className="relative z-10 min-h-screen"
          >
            <Preview3D
              wish={wish}
              mode="public"
              replayToken={replayToken}
              showOverlay={false}
              className="h-[100svh] rounded-none border-0 bg-transparent shadow-none"
            />

            <div className="pointer-events-none absolute inset-x-0 bottom-28 z-20 flex justify-start px-4 sm:px-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.75, ease: "easeOut" }}
                className="max-w-xl rounded-[2rem] border border-white/12 bg-slate-950/42 px-5 py-5 text-left backdrop-blur-xl sm:px-6"
              >
                <p className="text-[11px] uppercase tracking-[0.32em] text-white/45">Scene {activeStageLabel}</p>
                <FinaleMessage title={finaleMessage} caption={finaleCaption} active={stage === STORY_STAGES.CELEBRATION} />
                {shareUrl ? (
                  <p className="mt-3 text-sm text-cyan-100/80">
                    Shareable surprise ready: {shareUrl}
                  </p>
                ) : null}
              </motion.div>
            </div>
          </motion.section>
        ) : null}
      </AnimatePresence>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-40 flex flex-col gap-3 px-4 pb-4 sm:px-6 sm:pb-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="pointer-events-auto max-w-2xl">
            <AnimatePresence initial={false} mode="wait">
              {audioExpanded ? (
                <motion.div
                  key="audio-expanded"
                  initial={{ opacity: 0, y: 24, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 18, scale: 0.98 }}
                  transition={{ duration: 0.28, ease: "easeOut" }}
                  className="w-[min(100vw-2rem,42rem)] sm:w-[38rem]"
                >
                  <div className="mb-2 flex justify-start">
                    <button
                      type="button"
                      onClick={() => setAudioExpanded(false)}
                      className="rounded-full border border-white/10 bg-slate-950/70 px-3 py-1.5 text-xs uppercase tracking-[0.22em] text-white/65 backdrop-blur-xl transition hover:border-white/20 hover:text-white"
                    >
                      Hide soundtrack
                    </button>
                  </div>
                  <AudioControlBar
                    wish={wish}
                    compact
                    autoPlay
                    initialVolume={0.24}
                    muted={muted}
                    onMutedChange={setMuted}
                    title="BALL Soundtrack"
                    className="border-white/12 bg-slate-950/72 backdrop-blur-2xl"
                  />
                </motion.div>
              ) : (
                <div className="relative">
                  <div className="absolute left-0 top-0 h-0 w-0 overflow-hidden opacity-0">
                    <AudioControlBar
                      wish={wish}
                      compact
                      autoPlay
                      initialVolume={0.24}
                      muted={muted}
                      onMutedChange={setMuted}
                      title="BALL Soundtrack"
                      className="border-white/12 bg-slate-950/72 backdrop-blur-2xl"
                    />
                  </div>

                  <motion.button
                    key="audio-collapsed"
                    type="button"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 12 }}
                    whileHover={{ y: -2 }}
                    onClick={() => setAudioExpanded(true)}
                    className="flex items-center gap-3 rounded-[1.35rem] border border-white/12 bg-slate-950/62 px-4 py-3 text-left text-white shadow-glow backdrop-blur-xl"
                  >
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-cyan-300/12 text-cyan-100">
                      <Music4 className="h-4 w-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-xs uppercase tracking-[0.28em] text-cyan-100/70">BALL Soundtrack</span>
                      <span className="block truncate text-sm text-white/70">
                        {muted ? "Muted" : "Ambient music playing"} • Tap to expand
                      </span>
                    </span>
                    <ChevronUp className="h-4 w-4 text-white/55" />
                  </motion.button>
                </div>
              )}
            </AnimatePresence>
          </div>

          <div className="pointer-events-auto self-start sm:self-auto">
            <FooterBranding />
          </div>
        </div>
      </div>
    </div>
  );
}

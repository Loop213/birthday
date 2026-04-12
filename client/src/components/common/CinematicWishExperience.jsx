import {
  ChevronLeft,
  ChevronRight,
  Expand,
  Globe,
  Instagram,
  LoaderCircle,
  Minimize2,
  RotateCcw,
  Volume2,
  VolumeX
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { musicPresets } from "../../data/options.js";
import { defaultGalleryImages } from "../../data/defaultGallery.js";
import MagicLetterScene from "../three/MagicLetterScene.jsx";
import Preview3D from "../three/Preview3D.jsx";
import { playPaperOpenSound } from "../../utils/soundEffects.js";

const STORY_STAGES = {
  LOADING: "loading",
  LETTER: "letter",
  SHAYARI: "shayari",
  MESSAGE: "message",
  PHOTOS: "photos",
  FINALE: "finale"
};

const STAGE_SEQUENCE = [
  STORY_STAGES.LETTER,
  STORY_STAGES.SHAYARI,
  STORY_STAGES.MESSAGE,
  STORY_STAGES.PHOTOS,
  STORY_STAGES.FINALE
];

function splitLongText(text) {
  const clean = (text || "").trim();

  if (!clean) {
    return [];
  }

  const byLine = clean
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (byLine.length > 1) {
    return byLine;
  }

  return clean
    .split(/(?<=[.!?।])/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function FloatingBackdrop() {
  const particles = useMemo(
    () =>
      Array.from({ length: 38 }, (_, index) => ({
        id: index,
        size: 4 + (index % 5) * 5,
        left: `${(index * 8.4) % 100}%`,
        top: `${(index * 11.2) % 100}%`,
        duration: 7 + (index % 6),
        delay: index * 0.14
      })),
    []
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#8b5cf633,transparent_24%),radial-gradient(circle_at_75%_10%,#ec489944,transparent_24%),radial-gradient(circle_at_bottom,#38bdf833,transparent_32%),linear-gradient(145deg,#02030d,#10081d,#071426)]" />
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
            y: [0, -28, 0],
            x: [0, particle.id % 2 === 0 ? 18 : -18, 0],
            opacity: [0.14, 0.72, 0.14]
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

function ProgressRail({ stage }) {
  const labels = {
    [STORY_STAGES.LETTER]: "Arrival",
    [STORY_STAGES.SHAYARI]: "Shayari",
    [STORY_STAGES.MESSAGE]: "Message",
    [STORY_STAGES.PHOTOS]: "Memories",
    [STORY_STAGES.FINALE]: "Gift"
  };
  const currentIndex = STAGE_SEQUENCE.indexOf(stage);

  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/38 px-4 py-4 backdrop-blur-xl">
      <p className="text-[11px] uppercase tracking-[0.32em] text-white/45">Story Flow</p>
      <div className="mt-4 flex flex-col gap-2">
        {STAGE_SEQUENCE.map((stageName, index) => (
          <div key={stageName} className="flex items-center gap-3">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                index <= currentIndex ? "bg-cyan-200 shadow-[0_0_14px_rgba(103,232,249,0.8)]" : "bg-white/18"
              }`}
            />
            <span className={`text-sm ${index === currentIndex ? "text-white" : "text-white/45"}`}>
              {labels[stageName]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RevealParagraphs({ paragraphs, active, maxCollapsed = 4 }) {
  const [visibleCount, setVisibleCount] = useState(0);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!active) {
      setVisibleCount(0);
      setExpanded(false);
      return undefined;
    }

    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setVisibleCount(index);

      if (index >= paragraphs.length) {
        window.clearInterval(timer);
      }
    }, 350);

    return () => window.clearInterval(timer);
  }, [active, paragraphs]);

  const shownParagraphs = expanded
    ? paragraphs.slice(0, visibleCount)
    : paragraphs.slice(0, Math.min(visibleCount, maxCollapsed));
  const hiddenCount = Math.max(paragraphs.length - maxCollapsed, 0);

  return (
    <div className="space-y-4">
      {shownParagraphs.map((paragraph, index) => (
        <motion.p
          key={`${index}-${paragraph}`}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="text-base leading-8 text-white/78 sm:text-lg"
        >
          {paragraph}
        </motion.p>
      ))}

      {!expanded && hiddenCount > 0 && visibleCount >= maxCollapsed ? (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="rounded-full border border-white/12 bg-white/6 px-4 py-2 text-sm text-cyan-100 transition hover:bg-white/10"
        >
          Read More
        </button>
      ) : null}
    </div>
  );
}

function getFrameClass(frameStyle) {
  switch (frameStyle) {
    case "birthday":
      return "border-amber-300/40 bg-gradient-to-br from-amber-300/12 to-fuchsia-300/12 shadow-[0_0_38px_rgba(251,191,36,0.16)]";
    case "neon":
      return "border-cyan-300/45 bg-gradient-to-br from-cyan-300/12 to-fuchsia-400/12 shadow-[0_0_40px_rgba(34,211,238,0.18)]";
    case "classic":
      return "border-white/20 bg-slate-950/45 shadow-[0_0_24px_rgba(255,255,255,0.08)]";
    default:
      return "border-rose-300/30 bg-gradient-to-br from-rose-300/10 to-violet-300/10 shadow-[0_0_36px_rgba(244,114,182,0.16)]";
  }
}

function getPhotoAnimation(transition) {
  switch (transition) {
    case "slide":
      return {
        initial: { opacity: 0, x: 80 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -80 }
      };
    case "zoom":
      return {
        initial: { opacity: 0, scale: 0.88 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 1.08 }
      };
    case "flip":
      return {
        initial: { opacity: 0, rotateY: -80, scale: 0.94 },
        animate: { opacity: 1, rotateY: 0, scale: 1 },
        exit: { opacity: 0, rotateY: 80, scale: 0.94 }
      };
    default:
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 }
      };
  }
}

function PhotoStage({ images, frameStyle, transition, recipientName, photoIndex, setPhotoIndex }) {
  const animation = getPhotoAnimation(transition);

  return (
    <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
      <div className="rounded-[2rem] border border-white/12 bg-slate-950/30 p-6 backdrop-blur-xl">
        <p className="text-xs uppercase tracking-[0.32em] text-cyan-100/55">Memory Slideshow</p>
        <h2 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">
          Har photo me ek naya emotion chhupa hai
        </h2>
        <p className="mt-4 text-white/65">
          Tap through the memories in the exact order chosen while creating the surprise.
        </p>

        <div className="mt-6 flex gap-2">
          {images.map((image, index) => (
            <button
              key={`${image.url}-${index}`}
              type="button"
              onClick={() => setPhotoIndex(index)}
              className={`h-2.5 rounded-full transition-all ${
                photoIndex === index ? "w-10 bg-cyan-200" : "w-2.5 bg-white/25"
              }`}
              aria-label={`Open photo ${index + 1}`}
            />
          ))}
        </div>
      </div>

      <div className={`relative overflow-hidden rounded-[2rem] border p-3 backdrop-blur-xl ${getFrameClass(frameStyle)}`}>
        <img
          src={images[photoIndex]?.url}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full scale-110 object-cover blur-3xl opacity-30"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(15,23,42,0.08),rgba(2,6,23,0.7))]" />
        <AnimatePresence mode="wait">
          <motion.div
            key={images[photoIndex]?.url}
            {...animation}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="relative flex h-[340px] w-full items-center justify-center rounded-[1.5rem] p-4 sm:h-[420px] sm:p-6"
          >
            <img
              src={images[photoIndex]?.url}
              alt={`${recipientName} memory ${photoIndex + 1}`}
              className="max-h-full max-w-full object-contain"
            />
          </motion.div>
        </AnimatePresence>

        <div className="absolute inset-x-0 bottom-4 flex justify-center px-4">
          <div className="flex items-center gap-3 rounded-full border border-white/12 bg-slate-950/68 px-3 py-2 backdrop-blur-xl">
            <button
              type="button"
              onClick={() => setPhotoIndex((current) => (current - 1 + images.length) % images.length)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/6 text-white transition hover:scale-105 hover:border-cyan-300/35 hover:text-cyan-100 hover:shadow-glow"
              aria-label="Previous photo"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="min-w-[56px] text-center text-sm text-white/72">
              {photoIndex + 1} / {images.length}
            </span>
            <button
              type="button"
              onClick={() => setPhotoIndex((current) => (current + 1) % images.length)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/6 text-white transition hover:scale-105 hover:border-cyan-300/35 hover:text-cyan-100 hover:shadow-glow"
              aria-label="Next photo"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function GiftRevealBox({ open, onOpen }) {
  return (
    <motion.button
      type="button"
      onClick={onOpen}
      animate={open ? { scale: 1.04 } : { y: [0, -10, 0], rotateZ: [0, -1, 1, 0] }}
      transition={open ? { duration: 0.35 } : { repeat: Infinity, duration: 4.4, ease: "easeInOut" }}
      className="group relative mx-auto block h-72 w-72 bg-transparent [perspective:1100px] sm:h-80 sm:w-80"
    >
      <div className="absolute inset-0 rounded-[2.4rem] bg-[radial-gradient(circle_at_top,#ffffff22,transparent_60%)] blur-2xl" />
      <div className="absolute inset-0 [transform-style:preserve-3d]">
        <motion.div
          animate={open ? { rotateX: -128, y: -36 } : { rotateX: 0 }}
          transition={{ duration: 0.9, ease: [0.23, 1, 0.32, 1] }}
          className="absolute left-6 right-6 top-2 h-24 origin-bottom rounded-[1.8rem] border border-fuchsia-300/35 bg-gradient-to-b from-fuchsia-300/45 to-rose-400/25 shadow-[0_18px_60px_rgba(244,114,182,0.25)]"
        >
          <div className="absolute inset-x-12 top-9 h-5 rounded-full bg-cyan-100/70 blur-sm" />
        </motion.div>

        <div className="absolute inset-x-0 bottom-0 top-16 rounded-[2.4rem] border border-cyan-300/30 bg-gradient-to-br from-cyan-300/18 via-violet-300/18 to-fuchsia-300/18 shadow-[0_24px_70px_rgba(34,211,238,0.18)] backdrop-blur-xl" />
        <div className="absolute left-1/2 top-16 h-[calc(100%-4rem)] w-5 -translate-x-1/2 rounded-full bg-cyan-100/55" />
        <div className="absolute left-4 right-4 top-[46%] h-5 -translate-y-1/2 rounded-full bg-cyan-100/55" />

        {!open ? (
          <div className="absolute inset-x-0 bottom-8 text-center">
            <p className="text-sm uppercase tracking-[0.35em] text-white/72">Tap the gift to open</p>
          </div>
        ) : null}
      </div>
    </motion.button>
  );
}

function FooterLinks() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-white/65">
      <a
        href="https://ballwish.com"
        target="_blank"
        rel="noreferrer"
        className="rounded-full border border-white/10 bg-white/6 px-4 py-2 transition hover:border-cyan-300/35 hover:text-cyan-100"
      >
        <Globe className="mr-2 inline h-4 w-4" />
        ballwish.com
      </a>
      <a
        href="https://instagram.com"
        target="_blank"
        rel="noreferrer"
        className="rounded-full border border-white/10 bg-white/6 px-4 py-2 transition hover:border-cyan-300/35 hover:text-cyan-100"
      >
        <Instagram className="mr-2 inline h-4 w-4" />
        Instagram
      </a>
    </div>
  );
}

export default function CinematicWishExperience({ wish }) {
  const containerRef = useRef(null);
  const storyAudioRef = useRef(null);
  const isBirthdayBalloonTemplate = wish?.templateId === "birthday";
  const galleryImages = (wish?.images?.length
    ? wish.images
    : defaultGalleryImages.map((url) => ({ url }))).slice(0, 6);
  const shayariParagraphs = useMemo(() => {
    const lines = splitLongText(wish?.shayari);
    return lines.length
      ? lines
      : [
          "Har dua me tera naam saja rehta hai.",
          "Har khushi me tera hi chehra dikhta hai.",
          "Aaj ka din bas tumhari smile ke naam."
        ];
  }, [wish?.shayari]);
  const messageParagraphs = useMemo(() => {
    const lines = splitLongText(wish?.message);
    return lines.length
      ? lines
      : [
          `Happy Birthday ${wish?.recipientName || "Birthday Star"}.`,
          `Tu sirf ${wish?.relation?.toLowerCase() || "special"} nahi, meri family hai.`
        ];
  }, [wish?.message, wish?.recipientName, wish?.relation]);
  const presetTrack = musicPresets.find((preset) => preset.value === wish?.music?.preset);
  const defaultTrack = musicPresets.find((preset) => preset.isDefault);
  const storyTrack = wish?.music?.type === "upload" && wish?.music?.url
    ? wish.music.url
    : presetTrack?.url || defaultTrack?.url || "";
  const [stage, setStage] = useState(STORY_STAGES.LOADING);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [muted, setMuted] = useState(false);
  const [replayToken, setReplayToken] = useState(0);
  const [letterOpening, setLetterOpening] = useState(false);
  const [letterOpened, setLetterOpened] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [giftOpened, setGiftOpened] = useState(false);

  useEffect(() => {
    const handleChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener("fullscreenchange", handleChange);
    return () => document.removeEventListener("fullscreenchange", handleChange);
  }, []);

  useEffect(() => {
    const audio = storyAudioRef.current;
    if (!audio) {
      return;
    }

    audio.muted = muted;
  }, [muted]);

  useEffect(() => {
    const audio = storyAudioRef.current;
    if (!audio) {
      return;
    }

    if (
      stage !== STORY_STAGES.LOADING &&
      stage !== STORY_STAGES.FINALE &&
      !giftOpened &&
      storyTrack
    ) {
      audio.volume = 0.24;
      audio.play().catch(() => undefined);
      return;
    }

    audio.pause();
  }, [giftOpened, stage, storyTrack]);

  function beginStory() {
    setStage(STORY_STAGES.LETTER);
  }

  function startLetterOpening() {
    if (letterOpening) {
      return;
    }

    setLetterOpening(true);
    playPaperOpenSound();
  }

  function handleLetterOpened() {
    setLetterOpened(true);
  }

  function goToNextStage() {
    if (stage === STORY_STAGES.LETTER) {
      setStage(STORY_STAGES.SHAYARI);
      return;
    }

    if (stage === STORY_STAGES.SHAYARI) {
      setStage(STORY_STAGES.MESSAGE);
      return;
    }

    if (stage === STORY_STAGES.MESSAGE) {
      setStage(STORY_STAGES.PHOTOS);
      return;
    }

    if (stage === STORY_STAGES.PHOTOS) {
      setStage(STORY_STAGES.FINALE);
    }
  }

  function handleReplay() {
    setStage(STORY_STAGES.LOADING);
    setReplayToken((current) => current + 1);
    setLetterOpening(false);
    setLetterOpened(false);
    setPhotoIndex(0);
    setGiftOpened(false);

    if (storyAudioRef.current) {
      storyAudioRef.current.currentTime = 0;
      storyAudioRef.current.pause();
    }
  }

  function handleOpenGift() {
    setGiftOpened(true);

    if (storyAudioRef.current) {
      storyAudioRef.current.pause();
      storyAudioRef.current.currentTime = 0;
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

  return (
    <div ref={containerRef} className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <FloatingBackdrop />

      <audio ref={storyAudioRef} loop preload="none">
        {storyTrack ? <source src={storyTrack} /> : null}
      </audio>

      <div className="absolute right-4 top-4 z-40 flex flex-wrap justify-end gap-3 sm:right-6 sm:top-6">
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
          {isFullscreen ? "Exit" : "Fullscreen"}
        </button>
      </div>

      <div className="absolute left-4 top-4 z-40 sm:left-6 sm:top-6">
        <div className="rounded-full border border-cyan-300/18 bg-slate-950/50 px-4 py-2 backdrop-blur-xl">
          <span className="text-xs uppercase tracking-[0.34em] text-cyan-100/80">BALL Experience</span>
        </div>
      </div>

      <div className="absolute left-4 top-20 z-40 hidden sm:block sm:left-6">
        {stage !== STORY_STAGES.LOADING ? <ProgressRail stage={stage} /> : null}
      </div>

      <AnimatePresence mode="wait">
        {stage === STORY_STAGES.LOADING ? (
          <motion.section
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 flex min-h-screen items-center justify-center px-5"
          >
            <div className="w-full max-w-2xl rounded-[2.5rem] border border-white/12 bg-white/8 p-8 text-center shadow-[0_0_60px_rgba(34,211,238,0.08)] backdrop-blur-2xl sm:p-12">
              <LoaderCircle className="mx-auto h-10 w-10 animate-spin text-cyan-200" />
              <p className="mt-6 text-sm uppercase tracking-[0.38em] text-white/50">Preparing your story</p>
              <h1 className="mt-5 text-4xl font-semibold text-white sm:text-5xl">
                A birthday surprise for {wish?.recipientName || "someone special"}
              </h1>
              <p className="mt-4 text-lg leading-8 text-white/65">
                The story pauses after every step. Tap only when you are ready for the next emotion.
              </p>
              <button type="button" onClick={beginStory} className="button-primary mt-8">
                Start Story
              </button>
            </div>
          </motion.section>
        ) : null}

        {stage === STORY_STAGES.LETTER ? (
          <motion.section
            key="letter"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 min-h-screen px-4 py-20 sm:px-6"
          >
            <div className="mx-auto grid min-h-[calc(100vh-8rem)] max-w-7xl items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="space-y-6 rounded-[2.5rem] border border-white/12 bg-slate-950/35 p-8 backdrop-blur-2xl">
                <p className="text-xs uppercase tracking-[0.32em] text-cyan-100/55">Step 1</p>
                <h2 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
                  {isBirthdayBalloonTemplate
                    ? "Balloons pe letters aayenge, phir HAPPY BIRTHDAY khud banega"
                    : "Pehle ek khat khulega, phir dil ki baat saamne aayegi"}
                </h2>
                <p className="text-lg leading-8 text-white/68">
                  {isBirthdayBalloonTemplate
                    ? "Balloons ko float karte dekho. Alignment complete hone par next chapter tumhare tap se hi khulega."
                    : "Envelope par tap karo. Jab tak tum open nahi karoge, story yahin rukkar tumhara wait karegi."}
                </p>

                {isBirthdayBalloonTemplate ? (
                  <button type="button" onClick={goToNextStage} className="button-primary">
                    Continue to Shayari
                  </button>
                ) : letterOpened ? (
                  <button type="button" onClick={goToNextStage} className="button-primary">
                    Continue to Shayari
                  </button>
                ) : (
                  <button type="button" onClick={startLetterOpening} className="button-secondary">
                    Open Letter
                  </button>
                )}
              </div>

              {isBirthdayBalloonTemplate ? (
                <Preview3D
                  wish={wish}
                  mode="public"
                  replayToken={replayToken}
                  showOverlay={false}
                  className="min-h-[420px] border-white/12 bg-slate-950/32 sm:min-h-[560px]"
                />
              ) : (
                <MagicLetterScene
                  replayToken={replayToken}
                  opening={letterOpening}
                  onOpened={handleLetterOpened}
                  onOpenRequest={startLetterOpening}
                />
              )}
            </div>
          </motion.section>
        ) : null}

        {stage === STORY_STAGES.SHAYARI ? (
          <motion.section
            key="shayari"
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            className="relative z-10 min-h-screen px-4 py-20 sm:px-6"
          >
            <div className="mx-auto grid min-h-[calc(100vh-8rem)] max-w-7xl items-center gap-8 lg:grid-cols-[1fr_0.95fr]">
              <div className="rounded-[2.5rem] border border-white/12 bg-slate-950/35 p-8 backdrop-blur-2xl">
                <p className="text-xs uppercase tracking-[0.32em] text-fuchsia-100/55">Shayari</p>
                <h2 className="mt-4 text-4xl font-semibold text-white sm:text-5xl">
                  Har line me thoda sa pyaar, thoda sa intezar
                </h2>
                <div className="mt-8">
                  <RevealParagraphs paragraphs={shayariParagraphs} active />
                </div>
                <button type="button" onClick={goToNextStage} className="button-primary mt-8">
                  Continue to Message
                </button>
              </div>

              <motion.div
                animate={{ y: [0, -8, 0], scale: [1, 1.015, 1] }}
                transition={{ repeat: Infinity, duration: 5.2, ease: "easeInOut" }}
              >
                <Preview3D
                  wish={wish}
                  mode="public"
                  replayToken={replayToken}
                  showOverlay={false}
                  className="min-h-[340px] border-white/12 bg-slate-950/32 sm:min-h-[420px]"
                />
              </motion.div>
            </div>
          </motion.section>
        ) : null}

        {stage === STORY_STAGES.MESSAGE ? (
          <motion.section
            key="message"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            className="relative z-10 flex min-h-screen items-center justify-center px-4 py-20 sm:px-6"
          >
            <div className="w-full max-w-5xl rounded-[2.5rem] border border-white/12 bg-white/8 p-8 text-center backdrop-blur-2xl sm:p-12">
              <p className="text-xs uppercase tracking-[0.32em] text-amber-100/55">Main Message</p>
              <h2 className="mt-5 text-4xl font-semibold leading-tight text-white drop-shadow-[0_0_28px_rgba(244,114,182,0.2)] sm:text-6xl">
                🎂 Happy Birthday {wish?.recipientName || "Birthday Star"} 🎂
              </h2>
              <div className="mt-8 mx-auto max-w-3xl text-left">
                <RevealParagraphs paragraphs={messageParagraphs} active maxCollapsed={5} />
              </div>
              <button type="button" onClick={goToNextStage} className="button-primary mt-10">
                Continue to Memories
              </button>
            </div>
          </motion.section>
        ) : null}

        {stage === STORY_STAGES.PHOTOS ? (
          <motion.section
            key="photos"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 min-h-screen px-4 py-20 sm:px-6"
          >
            <div className="mx-auto max-w-7xl">
              <PhotoStage
                images={galleryImages}
                frameStyle={wish?.photoFrameStyle || "romantic"}
                transition={wish?.photoTransition || "fade"}
                recipientName={wish?.recipientName || "Birthday memory"}
                photoIndex={photoIndex}
                setPhotoIndex={setPhotoIndex}
              />

              <div className="mt-8 flex justify-center">
                <button type="button" onClick={goToNextStage} className="button-primary">
                  Continue to Final Gift
                </button>
              </div>
            </div>
          </motion.section>
        ) : null}

        {stage === STORY_STAGES.FINALE ? (
          <motion.section
            key="finale"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 flex min-h-screen items-center justify-center px-4 py-20 sm:px-6"
          >
            <div className="w-full max-w-5xl text-center">
              <p className="text-xs uppercase tracking-[0.34em] text-cyan-100/55">Final Surprise</p>
              <h2 className="mt-4 text-4xl font-semibold text-white sm:text-5xl">
                Aakhri gift tumhare liye
              </h2>
              <p className="mt-4 text-lg text-white/65">
                Tap the gift box to reveal the final message. Music stops here so the ending feels like a quiet surprise.
              </p>

              <div className="mt-10">
                <GiftRevealBox open={giftOpened} onOpen={handleOpenGift} />
              </div>

              <AnimatePresence>
                {giftOpened ? (
                  <motion.div
                    initial={{ opacity: 0, y: 26 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.55, ease: "easeOut" }}
                    className="mx-auto mt-10 max-w-3xl rounded-[2.2rem] border border-white/12 bg-slate-950/40 px-6 py-8 backdrop-blur-2xl"
                  >
                    <h3 className="text-3xl font-semibold text-white sm:text-4xl">
                      {wish?.message?.trim() || `${wish?.recipientName}, tum meri duniya ka sabse khoobsurat hissa ho.`}
                    </h3>
                    <p className="mt-5 text-lg leading-8 text-white/72">
                      {wish?.shayari?.trim() || `Aaj ka din tumhari khushi ke naam. Happy Birthday, ${wish?.recipientName || "Birthday Star"}.`}
                    </p>
                    <div className="mt-8">
                      <FooterLinks />
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </motion.section>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

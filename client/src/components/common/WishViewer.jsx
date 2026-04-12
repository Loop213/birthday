import {
  ChevronLeft,
  ChevronRight,
  Expand,
  MessageCircleMore,
  Minimize2,
  RotateCcw,
  Music4
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Preview3D from "../three/Preview3D.jsx";
import { getBirthdayTemplate } from "../../data/templates.js";
import { defaultGalleryImages } from "../../data/defaultGallery.js";
import AudioControlBar from "./AudioControlBar.jsx";

export default function WishViewer({
  wish,
  mode = "preview",
  shareUrl = "",
  allowShare = false
}) {
  const containerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [typedMessage, setTypedMessage] = useState("");
  const [replayToken, setReplayToken] = useState(0);
  const template = getBirthdayTemplate(wish?.templateId);
  const wishIdentity = wish?._id || wish?.id || wish?.shareSlug || template.id;
  const expiryLabel = wish?.expiresAt
    ? new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
        timeStyle: "short"
      }).format(new Date(wish.expiresAt))
    : "";
  const galleryImages = wish?.images?.length ? wish.images : defaultGalleryImages.map((url) => ({ url }));
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);

  useEffect(() => {
    if (!wish?.message) {
      setTypedMessage("");
      return undefined;
    }

    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setTypedMessage(wish.message.slice(0, index));

      if (index >= wish.message.length) {
        window.clearInterval(timer);
      }
    }, 28);

    return () => window.clearInterval(timer);
  }, [replayToken, wish?.message, wishIdentity]);

  useEffect(() => {
    const handleChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener("fullscreenchange", handleChange);
    return () => document.removeEventListener("fullscreenchange", handleChange);
  }, []);

  useEffect(() => {
    setActiveGalleryIndex(0);
  }, [wishIdentity]);

  useEffect(() => {
    if (galleryImages.length <= 1) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setActiveGalleryIndex((current) => (current + 1) % galleryImages.length);
    }, 3200);

    return () => window.clearInterval(timer);
  }, [galleryImages.length]);

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

  function shareOnWhatsapp() {
    if (!shareUrl) {
      return;
    }

    const text = encodeURIComponent(
      `A birthday surprise is ready for you.\n\nOpen it here: ${shareUrl}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  }

  function replayExperience() {
    setTypedMessage("");
    setReplayToken((current) => current + 1);
  }

  return (
    <div className="space-y-6" ref={containerRef}>
      <div className="glass-panel p-4 sm:p-6">
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <span className="badge">{template.shortLabel}</span>
            <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">
              {mode === "public" ? `Happy Birthday, ${wish.recipientName}` : `Preview for ${wish.recipientName}`}
            </h1>
            <p className="mt-2 text-white/60">
              {template.description}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={toggleFullscreen} className="button-secondary">
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Expand className="h-4 w-4" />}
              {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            </button>
            <button type="button" onClick={replayExperience} className="button-secondary">
              <RotateCcw className="h-4 w-4" />
              Replay
            </button>
            {allowShare && shareUrl ? (
              <button type="button" onClick={shareOnWhatsapp} className="button-secondary">
                <MessageCircleMore className="h-4 w-4" />
                WhatsApp
              </button>
            ) : null}
          </div>
        </div>

        <Preview3D wish={wish} mode={mode} replayToken={replayToken} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.18fr_0.82fr]">
        <div className="glass-panel p-6">
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-[1.5rem] border border-fuchsia-300/12 bg-white/5 p-5">
              <p className="text-xs uppercase tracking-[0.26em] text-fuchsia-100/55">Shayari</p>
              <blockquote className="mt-4 min-h-[140px] text-lg italic leading-8 text-rose-50/85">
                {wish?.shayari || "No extra shayari was added, so the template itself carries the emotion."}
              </blockquote>
            </div>

            <div className="rounded-[1.5rem] border border-cyan-300/12 bg-white/5 p-5">
              <p className="text-xs uppercase tracking-[0.26em] text-cyan-100/55">Message</p>
              <p className="mt-4 min-h-[140px] text-lg leading-8 text-white/80">
                {typedMessage}
                {wish?.message ? (
                  <span className="ml-1 inline-block h-5 w-1 animate-pulse rounded-full bg-cyan-200 align-middle" />
                ) : null}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-panel p-6">
          <div className="flex items-center gap-3 text-white/80">
            <Music4 className="h-4 w-4 text-cyan-200" />
            <span>Background soundtrack</span>
          </div>
          <AudioControlBar wish={wish} compact className="mt-4" />

          {wish?.voiceMessage?.url ? (
            <div className="mt-6">
              <p className="text-sm uppercase tracking-[0.22em] text-white/45">Voice message</p>
              <audio controls className="mt-3 w-full">
                <source src={wish.voiceMessage.url} />
              </audio>
            </div>
          ) : null}

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-white/45">Relation</p>
              <p className="mt-2 text-lg font-medium text-white">{wish.relation}</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-white/45">Template</p>
              <p className="mt-2 text-lg font-medium text-white">{template.shortLabel}</p>
            </div>
            {mode === "public" && expiryLabel ? (
              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4 sm:col-span-2">
                <p className="text-xs uppercase tracking-[0.22em] text-white/45">Available Until</p>
                <p className="mt-2 text-lg font-medium text-white">{expiryLabel}</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {galleryImages.length ? (
        <div className="glass-panel p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-white">Memory gallery</h2>
              <p className="mt-2 text-white/55">
                {wish?.images?.length
                  ? "Uploaded memories drifting through the celebration."
                  : "Beautiful fallback frames keep the page glowing even before photos are added."}
              </p>
            </div>
            <div className="flex gap-2">
              {galleryImages.map((image, index) => (
                <button
                  key={`${image.url}-${index}`}
                  type="button"
                  onClick={() => setActiveGalleryIndex(index)}
                  className={`h-2.5 rounded-full transition-all ${
                    index === activeGalleryIndex ? "w-10 bg-cyan-200" : "w-2.5 bg-white/25"
                  }`}
                  aria-label={`Open gallery image ${index + 1}`}
                />
              ))}
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_0.8fr]">
            <motion.div
              key={galleryImages[activeGalleryIndex]?.url}
              initial={{ opacity: 0, y: 18, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="relative group overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-950/55"
            >
              <img
                src={galleryImages[activeGalleryIndex]?.url}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 h-full w-full scale-110 object-cover blur-2xl opacity-35"
              />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(15,23,42,0.08),rgba(2,6,23,0.7))]" />
              <div className="relative flex h-[320px] w-full items-center justify-center p-4 sm:p-6">
                <img
                  src={galleryImages[activeGalleryIndex]?.url}
                  alt={wish.recipientName}
                  className="max-h-full max-w-full object-contain transition duration-500 group-hover:scale-[1.02]"
                />
              </div>

              <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center pb-4">
                <div className="pointer-events-auto flex items-center gap-3 rounded-full border border-white/12 bg-slate-950/65 px-3 py-2 backdrop-blur-xl">
                  <button
                    type="button"
                    onClick={() => setActiveGalleryIndex((current) => (current - 1 + galleryImages.length) % galleryImages.length)}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/6 text-white transition hover:scale-105 hover:border-cyan-300/35 hover:text-cyan-100 hover:shadow-glow"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <span className="min-w-[56px] text-center text-sm text-white/72">
                    {activeGalleryIndex + 1} / {galleryImages.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveGalleryIndex((current) => (current + 1) % galleryImages.length)}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/6 text-white transition hover:scale-105 hover:border-cyan-300/35 hover:text-cyan-100 hover:shadow-glow"
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </motion.div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {galleryImages.slice(0, 3).map((image, index) => (
                <motion.button
                  key={`${image.url}-${index}-thumb`}
                  type="button"
                  whileHover={{ y: -4 }}
                  onClick={() => setActiveGalleryIndex(index)}
                  className={`overflow-hidden rounded-[1.35rem] border bg-white/5 text-left transition ${
                    index === activeGalleryIndex
                      ? "border-cyan-300/45 shadow-glow"
                      : "border-white/10"
                  }`}
                >
                  <img
                    src={image.url}
                    alt={`${wish.recipientName} memory ${index + 1}`}
                    className="h-24 w-full object-contain bg-slate-950/60"
                  />
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

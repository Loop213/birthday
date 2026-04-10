import {
  Expand,
  MessageCircleMore,
  Minimize2,
  Music4,
  Pause,
  Play,
  RotateCcw,
  Volume2,
  VolumeX
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Preview3D from "../three/Preview3D.jsx";
import { getBirthdayTemplate } from "../../data/templates.js";
import { musicPresets } from "../../data/options.js";

export default function WishViewer({
  wish,
  mode = "preview",
  shareUrl = "",
  allowShare = false
}) {
  const containerRef = useRef(null);
  const audioRef = useRef(null);
  const [muted, setMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [typedMessage, setTypedMessage] = useState("");
  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolume] = useState(0.72);
  const [replayToken, setReplayToken] = useState(0);
  const template = getBirthdayTemplate(wish?.templateId);
  const presetTrack = musicPresets.find((preset) => preset.value === wish?.music?.preset);
  const defaultTrack = musicPresets.find((preset) => preset.isDefault) || musicPresets[0];
  const audioSource =
    wish?.music?.type === "upload"
      ? wish?.music?.url
      : presetTrack?.url || defaultTrack?.url;
  const wishIdentity = wish?._id || wish?.id || wish?.shareSlug || template.id;
  const expiryLabel = wish?.expiresAt
    ? new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
        timeStyle: "short"
      }).format(new Date(wish.expiresAt))
    : "";

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
    if (!audioRef.current) {
      return;
    }

    audioRef.current.muted = muted;
    audioRef.current.volume = volume;

    if (isPlaying) {
      audioRef.current.play().catch(() => undefined);
      return;
    }

    audioRef.current.pause();
  }, [muted, audioSource, isPlaying, volume]);

  useEffect(() => {
    setIsPlaying(true);
    setVolume(0.72);
  }, [wishIdentity]);

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

  function togglePlayback() {
    setIsPlaying((current) => !current);
  }

  function replayExperience() {
    setTypedMessage("");
    setReplayToken((current) => current + 1);

    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      if (isPlaying) {
        audioRef.current.play().catch(() => undefined);
      }
    }
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
            <button type="button" onClick={() => setMuted((current) => !current)} className="button-secondary">
              {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              {muted ? "Unmute" : "Mute"}
            </button>
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

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="glass-panel p-6">
          <p className="text-xs uppercase tracking-[0.22em] text-white/45">Message</p>
          <p className="mt-4 min-h-[84px] text-lg leading-8 text-white/80">
            {typedMessage}
            {wish?.message ? (
              <span className="ml-1 inline-block h-5 w-1 animate-pulse rounded-full bg-cyan-200 align-middle" />
            ) : null}
          </p>

          <blockquote className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/5 p-5 text-white/70">
            {wish?.shayari || "No extra shayari was added, so the template itself carries the emotion."}
          </blockquote>
        </div>

        <div className="glass-panel p-6">
          <div className="flex items-center gap-3 text-white/80">
            <Music4 className="h-4 w-4 text-cyan-200" />
            <span>Background soundtrack</span>
          </div>
          {audioSource ? (
            <>
              <audio ref={audioRef} autoPlay loop className="hidden">
                <source src={audioSource} />
              </audio>
              <div className="mt-4 rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-white/60">
                  {wish?.music?.type === "upload"
                    ? "Custom uploaded track"
                    : presetTrack?.label || defaultTrack?.label || "Default birthday instrumental"}
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button type="button" onClick={togglePlayback} className="button-secondary">
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    {isPlaying ? "Pause" : "Play"}
                  </button>
                  <button type="button" onClick={() => setMuted((current) => !current)} className="button-secondary">
                    {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    {muted ? "Unmute" : "Mute"}
                  </button>
                </div>
                <label className="mt-4 block space-y-2">
                  <span className="text-xs uppercase tracking-[0.22em] text-white/45">Volume</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={volume}
                    onChange={(event) => setVolume(Number(event.target.value))}
                    className="w-full accent-cyan-300"
                  />
                </label>
              </div>
            </>
          ) : (
            <p className="mt-4 text-sm text-white/55">No music track attached for this wish.</p>
          )}

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

      {wish?.images?.length ? (
        <div className="glass-panel p-6">
          <h2 className="text-2xl font-semibold text-white">Memory gallery</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {wish.images.map((image) => (
              <img
                key={image.url}
                src={image.url}
                alt={wish.recipientName}
                className="h-56 w-full rounded-[1.5rem] object-cover"
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

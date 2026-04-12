import {
  LoaderCircle,
  Music2,
  Pause,
  Play,
  Upload,
  Volume2,
  VolumeX
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { musicPresets } from "../../data/options.js";

const PREVIEW_LIMIT_SECONDS = 30;

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export default function AudioControlBar({
  wish,
  compact = false,
  className = "",
  autoPlay = true,
  initialVolume = 0.26,
  muted: mutedProp,
  onMutedChange,
  title = "Music Control"
}) {
  const mainAudioRef = useRef(null);
  const previewAudioRef = useRef(null);
  const customUrlRef = useRef("");
  const [mode, setMode] = useState(wish?.music?.type === "upload" ? "custom" : "default");
  const [customTrack, setCustomTrack] = useState(null);
  const [volume, setVolume] = useState(initialVolume);
  const [internalMuted, setInternalMuted] = useState(false);
  const [silenced, setSilenced] = useState(!autoPlay);
  const [mainPlaying, setMainPlaying] = useState(autoPlay);
  const [previewTrackId, setPreviewTrackId] = useState("");
  const [previewPlaying, setPreviewPlaying] = useState(false);
  const [previewProgress, setPreviewProgress] = useState(0);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [mainProgress, setMainProgress] = useState(0);
  const [mainDuration, setMainDuration] = useState(0);
  const wishPreset = musicPresets.find((preset) => preset.value === wish?.music?.preset);
  const defaultTrack = musicPresets.find((preset) => preset.isDefault) || musicPresets[0];
  const runtimeTracks = useMemo(() => {
    const tracks = [
      {
        id: "default-built-in",
        label: "Built-in Ambient",
        source: defaultTrack?.url || "",
        kind: "default"
      }
    ];

    if (wishPreset && wishPreset.value !== defaultTrack?.value) {
      tracks.push({
        id: wishPreset.value,
        label: wishPreset.label,
        source: wishPreset.url,
        kind: "preset"
      });
    }

    if (wish?.music?.type === "upload" && wish?.music?.url) {
      tracks.push({
        id: "wish-upload",
        label: wish?.music?.name || "Wish Custom Song",
        source: wish.music.url,
        kind: "custom"
      });
    }

    return tracks.filter((track) => track.source);
  }, [defaultTrack?.url, defaultTrack?.value, wish?.music?.name, wish?.music?.type, wish?.music?.url, wishPreset]);

  const activeTrack = useMemo(() => {
    if (mode === "custom" && customTrack?.url) {
      return customTrack;
    }

    if (mode === "custom") {
      const uploadedWishTrack = runtimeTracks.find((track) => track.id === "wish-upload");
      return uploadedWishTrack || runtimeTracks[0];
    }

    return runtimeTracks[0];
  }, [customTrack, mode, runtimeTracks]);
  const muted = typeof mutedProp === "boolean" ? mutedProp : internalMuted;

  useEffect(() => {
    setVolume(initialVolume);
  }, [initialVolume]);

  useEffect(() => {
    setMode(wish?.music?.type === "upload" ? "custom" : "default");
  }, [wish?._id, wish?.id, wish?.music?.type, wish?.shareSlug]);

  useEffect(() => {
    return () => {
      if (customUrlRef.current) {
        URL.revokeObjectURL(customUrlRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const audio = mainAudioRef.current;
    if (!audio || !activeTrack?.source) {
      return;
    }

    audio.volume = volume;
    audio.muted = muted;

    if (silenced || !mainPlaying) {
      audio.pause();
      return;
    }

    if (previewPlaying && previewAudioRef.current) {
      previewAudioRef.current.pause();
      setPreviewPlaying(false);
      setPreviewTrackId("");
    }

    audio.play().catch(() => undefined);
  }, [activeTrack?.source, mainPlaying, muted, previewPlaying, silenced, volume]);

  useEffect(() => {
    const audio = mainAudioRef.current;
    if (!audio) {
      return undefined;
    }

    function handleTimeUpdate() {
      setMainProgress(audio.currentTime);
    }

    function handleLoadedMetadata() {
      setMainDuration(audio.duration || 0);
    }

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, []);

  useEffect(() => {
    setMainProgress(0);
    setMainDuration(0);
  }, [activeTrack?.source]);

  function toggleMainPlayback() {
    if (mainPlaying) {
      setMainPlaying(false);
      setSilenced(true);
      return;
    }

    setSilenced(false);
    setMainPlaying(true);
  }

  function toggleMute() {
    if (onMutedChange) {
      onMutedChange(!muted);
      return;
    }

    setInternalMuted((current) => !current);
  }

  function switchMode(nextMode) {
    setMode(nextMode);
    setSilenced(false);
    setMainPlaying(true);
  }

  function handleCustomFileChange(event) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (customUrlRef.current) {
      URL.revokeObjectURL(customUrlRef.current);
    }

    const url = URL.createObjectURL(file);
    customUrlRef.current = url;
    setCustomTrack({
      id: `custom-local-${Date.now()}`,
      label: file.name,
      url,
      kind: "custom"
    });
    setMode("custom");
    setSilenced(false);
    setMainPlaying(true);
  }

  function playPreview(track) {
    const previewAudio = previewAudioRef.current;
    const mainAudio = mainAudioRef.current;

    if (!previewAudio || !track?.source) {
      return;
    }

    if (previewTrackId === track.id && previewPlaying) {
      previewAudio.pause();
      setPreviewPlaying(false);
      return;
    }

    setPreviewLoading(true);
    previewAudio.src = track.source;
    previewAudio.currentTime = 0;
    previewAudio.volume = Math.max(volume, 0.22);
    previewAudio.muted = muted;
    setPreviewTrackId(track.id);
    setPreviewProgress(0);
    setPreviewPlaying(true);

    if (mainAudio) {
      mainAudio.pause();
    }

    previewAudio.play()
      .then(() => setPreviewLoading(false))
      .catch(() => {
        setPreviewLoading(false);
        setPreviewPlaying(false);
      });
  }

  useEffect(() => {
    const previewAudio = previewAudioRef.current;
    if (!previewAudio) {
      return undefined;
    }

    function handlePreviewTimeUpdate() {
      const limitedProgress = Math.min(previewAudio.currentTime, PREVIEW_LIMIT_SECONDS);
      setPreviewProgress(limitedProgress);

      if (previewAudio.currentTime >= PREVIEW_LIMIT_SECONDS) {
        previewAudio.pause();
        previewAudio.currentTime = 0;
        setPreviewPlaying(false);
        setPreviewProgress(0);

        if (!silenced && mainPlaying && mainAudioRef.current) {
          mainAudioRef.current.play().catch(() => undefined);
        }
      }
    }

    function handlePreviewEnded() {
      setPreviewPlaying(false);
      setPreviewProgress(0);

      if (!silenced && mainPlaying && mainAudioRef.current) {
        mainAudioRef.current.play().catch(() => undefined);
      }
    }

    previewAudio.addEventListener("timeupdate", handlePreviewTimeUpdate);
    previewAudio.addEventListener("ended", handlePreviewEnded);

    return () => {
      previewAudio.removeEventListener("timeupdate", handlePreviewTimeUpdate);
      previewAudio.removeEventListener("ended", handlePreviewEnded);
    };
  }, [mainPlaying, silenced]);

  const trackName = activeTrack?.label || "Ambient background";

  return (
    <div className={`glass-panel border-white/12 bg-slate-950/55 p-4 shadow-glow backdrop-blur-2xl ${className}`}>
      <audio ref={mainAudioRef} loop preload="none">
        {activeTrack?.source ? <source src={activeTrack.source} /> : null}
      </audio>
      <audio ref={previewAudioRef} preload="none" className="hidden" />

      <div className={`flex ${compact ? "flex-col gap-4" : "flex-col gap-5 lg:flex-row lg:items-start lg:justify-between"}`}>
        <div className="min-w-0">
          <div className="flex items-center gap-3 text-cyan-100">
            <Music2 className="h-4 w-4" />
            <span className="text-sm font-medium uppercase tracking-[0.24em]">{title}</span>
          </div>
          <p className="mt-3 truncate text-lg font-semibold text-white">{trackName}</p>
          <p className="mt-1 text-sm text-white/55">
            {mode === "custom"
              ? "Custom song active. Default ambient music is paused."
              : "Built-in ambient track running softly in the background."}
          </p>
        </div>

        <div className={`flex ${compact ? "flex-col gap-4" : "flex-col gap-4 lg:min-w-[420px]"}`}>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={toggleMainPlayback} className="button-secondary">
              {mainPlaying && !silenced ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {mainPlaying && !silenced ? "Pause" : "Play"}
            </button>
            <button type="button" onClick={toggleMute} className="button-secondary">
              {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              {muted ? "Unmute" : "Mute"}
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => switchMode("default")}
              className={`rounded-[1.35rem] border px-4 py-3 text-left transition ${
                mode === "default"
                  ? "border-cyan-300/40 bg-cyan-300/10"
                  : "border-white/10 bg-white/5 hover:bg-white/8"
              }`}
            >
              <p className="font-semibold text-white">Default Music</p>
              <p className="mt-1 text-sm text-white/55">Soft built-in ambient loop at low volume</p>
            </button>

            <label
              className={`cursor-pointer rounded-[1.35rem] border px-4 py-3 transition ${
                mode === "custom"
                  ? "border-fuchsia-300/35 bg-fuchsia-300/10"
                  : "border-white/10 bg-white/5 hover:bg-white/8"
              }`}
            >
              <div className="flex items-start gap-3">
                <Upload className="mt-0.5 h-4 w-4 text-fuchsia-100" />
                <div>
                  <p className="font-semibold text-white">Use Your Own Song</p>
                  <p className="mt-1 text-sm text-white/55">MP3 or WAV. Replaces the built-in background.</p>
                </div>
              </div>
              <input type="file" accept=".mp3,.wav,audio/mpeg,audio/wav" onChange={handleCustomFileChange} className="hidden" />
            </label>
          </div>

          <div className="rounded-[1.35rem] border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs uppercase tracking-[0.22em] text-white/45">Volume</span>
              <span className="text-sm text-white/60">{Math.round((muted ? 0 : volume) * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(event) => {
                setVolume(Number(event.target.value));
                setMuted(false);
              }}
              className="mt-3 w-full accent-cyan-300"
            />

            <div className="mt-4 flex items-center justify-between text-sm text-white/50">
              <span>{formatTime(mainProgress)}</span>
              <span>{mainDuration ? formatTime(mainDuration) : "--:--"}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-[1.35rem] border border-white/10 bg-white/5 p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-white">Song Preview</p>
            <p className="mt-1 text-xs uppercase tracking-[0.22em] text-white/45">30 sec fast preview</p>
          </div>
          <div className="text-sm text-white/55">
            {previewTrackId ? `${formatTime(previewProgress)} / ${formatTime(PREVIEW_LIMIT_SECONDS)}` : "Select a track"}
          </div>
        </div>

        <div className="mt-4 grid gap-3">
          {[
            ...runtimeTracks,
            ...(customTrack?.url ? [{ id: customTrack.id, label: customTrack.label, source: customTrack.url, kind: "custom" }] : [])
          ]
            .filter((track, index, array) => array.findIndex((item) => item.id === track.id) === index)
            .map((track) => (
              <div
                key={track.id}
                className={`rounded-[1.1rem] border px-4 py-3 transition ${
                  previewTrackId === track.id
                    ? "border-cyan-300/40 bg-cyan-300/10"
                    : "border-white/10 bg-slate-950/35"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-white">{track.label}</p>
                    <p className="mt-1 text-sm text-white/50">
                      {track.kind === "custom" ? "Custom audio" : track.kind === "preset" ? "Wish preset" : "Built-in default"}
                    </p>
                  </div>

                  <button type="button" onClick={() => playPreview(track)} className="button-secondary shrink-0">
                    {previewLoading && previewTrackId === track.id ? (
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                    ) : previewTrackId === track.id && previewPlaying ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                    {previewTrackId === track.id && previewPlaying ? "Pause Preview" : "Preview"}
                  </button>
                </div>

                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-fuchsia-400 transition-all"
                    style={{
                      width: `${previewTrackId === track.id ? (previewProgress / PREVIEW_LIMIT_SECONDS) * 100 : 0}%`
                    }}
                  />
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

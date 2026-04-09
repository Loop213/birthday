import confetti from "canvas-confetti";
import { Heart, LockKeyhole, MessageCircleHeart, Music4, PartyPopper, Volume2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Helmet } from "react-helmet-async";
import { useParams } from "react-router-dom";
import api, { extractErrorMessage } from "../api/http.js";
import WishExperience from "../components/three/WishExperience.jsx";
import { musicPresets, themePalette } from "../data/options.js";

function formatDate(value) {
  if (!value) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export default function PublicWishPage() {
  const { slug } = useParams();
  const audioRef = useRef(null);
  const [meta, setMeta] = useState(null);
  const [wish, setWish] = useState(null);
  const [password, setPassword] = useState("");
  const [typedMessage, setTypedMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [unlocking, setUnlocking] = useState(false);

  async function loadMeta() {
    try {
      const response = await api.get(`/wishes/public/meta/${slug}`);
      setMeta(response.data.data);
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMeta();
  }, [slug]);

  useEffect(() => {
    if (!wish?.message) {
      setTypedMessage("");
      return;
    }

    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setTypedMessage(wish.message.slice(0, index));
      if (index >= wish.message.length) {
        window.clearInterval(timer);
      }
    }, 32);

    return () => window.clearInterval(timer);
  }, [wish?.message]);

  useEffect(() => {
    if (wish && audioRef.current) {
      audioRef.current.play().catch(() => undefined);
    }
  }, [wish]);

  async function unlockWish(event) {
    event.preventDefault();
    setUnlocking(true);

    try {
      const response = await api.post(`/wishes/public/access/${slug}`, { password });
      setWish(response.data.data.wish);
      launchFireworks();
      toast.success("Birthday page unlocked.");
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setUnlocking(false);
    }
  }

  function launchFireworks() {
    confetti({
      particleCount: 140,
      spread: 86,
      origin: { y: 0.6 }
    });
  }

  const theme = themePalette[wish?.theme || meta?.theme || "romantic"];
  const musicPreset = musicPresets.find((track) => track.value === wish?.music?.preset);
  const audioSource = wish?.music?.type === "upload" ? wish.music.url : musicPreset?.url;
  const imageGridClass = (wish?.images?.length || 0) >= 3 ? "md:grid-cols-3" : "md:grid-cols-2";

  return (
    <>
      <Helmet>
        <title>
          {wish?.recipientName || meta?.recipientName || "Birthday Wish"} | Birthday Glow
        </title>
        <meta
          name="description"
          content={`Unlock a private 3D birthday wish experience for ${wish?.recipientName || meta?.recipientName || "someone special"}.`}
        />
      </Helmet>

      <div className="min-h-screen bg-ink px-4 py-10 sm:px-6 lg:px-8" onClick={wish ? launchFireworks : undefined}>
        <div className="mx-auto max-w-6xl">
          {loading ? (
            <div className="glass-panel px-6 py-8 text-white/70">Loading the surprise...</div>
          ) : !meta && !wish ? (
            <div className="glass-panel px-6 py-10 text-center">
              <h1 className="text-3xl font-semibold text-white">This birthday page is unavailable</h1>
              <p className="mt-3 text-white/60">
                The link may have expired, been removed, or never existed.
              </p>
            </div>
          ) : !wish ? (
            <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="glass-panel overflow-hidden p-6 sm:p-8">
                <div className={`rounded-[2rem] bg-gradient-to-br ${theme.halo} p-3`}>
                  <WishExperience accent={theme.accent} glow={theme.glow} />
                </div>
                <div className="mt-6">
                  <span className="badge">Private celebration</span>
                  <h1 className="mt-4 text-4xl font-semibold text-white sm:text-5xl">
                    A birthday page is waiting for {meta?.recipientName}
                  </h1>
                  <p className="mt-3 max-w-2xl text-white/65">
                    This premium wish experience is protected by a password and auto-expires 24 hours after activation.
                  </p>
                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-[0.22em] text-white/45">Theme</p>
                      <p className="mt-2 text-xl font-semibold text-white">{meta?.theme}</p>
                    </div>
                    <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-[0.22em] text-white/45">Expires</p>
                      <p className="mt-2 text-white/75">{formatDate(meta?.expiresAt)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass-panel p-8 sm:p-10">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-cyan-200">
                  <LockKeyhole className="h-6 w-6" />
                </div>
                <h2 className="mt-6 text-3xl font-semibold text-white">Unlock the birthday surprise</h2>
                <p className="mt-3 text-white/60">
                  Enter the password shared by the creator to reveal the full 3D page, music, photos, and heartfelt message.
                </p>

                <form onSubmit={unlockWish} className="mt-8 space-y-4">
                  <label className="space-y-2">
                    <span className="field-label">Access password</span>
                    <input
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="field-input"
                      required
                    />
                  </label>

                  <button type="submit" disabled={unlocking} className="button-primary w-full justify-center">
                    {unlocking ? "Unlocking..." : "Open Celebration"}
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
                <div className="glass-panel overflow-hidden p-6 sm:p-8">
                  <div className={`rounded-[2rem] bg-gradient-to-br ${theme.halo} p-3`}>
                    <WishExperience accent={theme.accent} glow={theme.glow} />
                  </div>
                  <div className="mt-6">
                    <span className="badge">{wish.relation}</span>
                    <h1 className="mt-4 text-4xl font-semibold text-white sm:text-5xl">
                      Happy Birthday, {wish.recipientName}
                    </h1>
                    <p className="mt-4 min-h-[96px] text-lg leading-8 text-white/75">
                      {typedMessage}
                      <span className="ml-1 inline-block h-6 w-1 animate-pulse rounded-full bg-cyan-200 align-middle" />
                    </p>
                  </div>
                </div>

                <div className="glass-panel p-6 sm:p-8">
                  <div className="flex items-center gap-3 text-pink-200">
                    <Heart className="h-5 w-5" />
                    <span>Made with care</span>
                  </div>
                  <blockquote className="mt-6 rounded-[1.75rem] border border-white/10 bg-white/5 p-6 text-lg leading-8 text-white/75">
                    {wish.shayari || "No shayari was added, but the celebration is still glowing beautifully."}
                  </blockquote>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <button type="button" onClick={launchFireworks} className="button-primary justify-center">
                      <PartyPopper className="h-4 w-4" />
                      Fireworks
                    </button>
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(
                        `Look at this birthday surprise for ${wish.recipientName}: ${window.location.href}`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="button-secondary justify-center"
                    >
                      <MessageCircleHeart className="h-4 w-4" />
                      Share on WhatsApp
                    </a>
                  </div>

                  <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-5">
                    <div className="flex items-center gap-3 text-white/70">
                      <Music4 className="h-4 w-4 text-cyan-200" />
                      <span>Background music</span>
                    </div>
                    {audioSource ? (
                      <audio ref={audioRef} controls autoPlay loop className="mt-4 w-full">
                        <source src={audioSource} />
                      </audio>
                    ) : (
                      <p className="mt-3 text-sm text-white/55">No music track was attached to this wish.</p>
                    )}

                    {wish.voiceMessage?.url ? (
                      <div className="mt-5">
                        <div className="flex items-center gap-3 text-white/70">
                          <Volume2 className="h-4 w-4 text-amber-200" />
                          <span>Voice note</span>
                        </div>
                        <audio controls className="mt-3 w-full">
                          <source src={wish.voiceMessage.url} />
                        </audio>
                      </div>
                    ) : null}
                  </div>
                </div>
              </section>

              {wish.images?.length ? (
                <section className="glass-panel p-6 sm:p-8">
                  <h2 className="text-2xl font-semibold text-white">Memory gallery</h2>
                  <p className="mt-2 text-white/60">A few moments the creator wanted to keep glowing here.</p>
                  <div className={`mt-6 grid gap-4 ${imageGridClass}`}>
                    {wish.images.map((image) => (
                      <img
                        key={image.url}
                        src={image.url}
                        alt={wish.recipientName}
                        className="h-72 w-full rounded-[1.75rem] object-cover"
                      />
                    ))}
                  </div>
                </section>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

import { AlertTriangle, LockKeyhole, Sparkles, TimerReset } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Helmet } from "react-helmet-async";
import { useParams } from "react-router-dom";
import api, { extractErrorMessage } from "../api/http.js";
import CountdownTimer from "../components/common/CountdownTimer.jsx";
import WishViewer from "../components/common/WishViewer.jsx";
import { getBirthdayTemplate } from "../data/templates.js";

function formatDateTime(value) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export default function PublicWishPage() {
  const { slug } = useParams();
  const [meta, setMeta] = useState(null);
  const [wish, setWish] = useState(null);
  const [password, setPassword] = useState("");
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [unlocking, setUnlocking] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [accessState, setAccessState] = useState("");
  const [unlockTarget, setUnlockTarget] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadMeta() {
      setLoadingMeta(true);
      setLoadError("");

      try {
        const response = await api.get(`/wishes/public/meta/${slug}`);

        if (!isMounted) {
          return;
        }

        setMeta(response.data.data);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        const message = extractErrorMessage(error);
        setLoadError(message);
        toast.error(message);
      } finally {
        if (isMounted) {
          setLoadingMeta(false);
        }
      }
    }

    loadMeta();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  const unlockWish = useCallback(async (event, options = {}) => {
    event?.preventDefault?.();

    const nextPassword = options.password ?? password;

    if (!nextPassword.trim()) {
      toast.error("Enter the password to open this birthday wish.");
      return;
    }

    setUnlocking(true);

    try {
      const response = await api.post(`/wishes/public/access/${slug}`, {
        password: nextPassword
      });

      const payload = response.data.data;
      setAccessState(payload.accessState || "");
      setUnlockTarget(payload.unlocksAt || "");

      if (payload.accessState === "countdown") {
        setWish(payload.wish);
        toast.success("Countdown unlocked. The surprise will open right on time.");
      } else {
        setWish(payload.wish);
        toast.success("Birthday wish unlocked.");
      }
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setUnlocking(false);
    }
  }, [password, slug]);

  const template = getBirthdayTemplate(meta?.templateId || wish?.templateId);
  const expiresLabel = useMemo(() => formatDateTime(meta?.expiresAt || wish?.expiresAt), [meta?.expiresAt, wish?.expiresAt]);
  const isExpired = Boolean(meta?.expiresAt && new Date(meta.expiresAt) <= new Date());
  const countdownTarget = unlockTarget || meta?.scheduleAt || wish?.scheduleAt || "";
  const isScheduledLocked = Boolean(countdownTarget && new Date(countdownTarget) > new Date());
  const canOpenWish = accessState === "open" || (meta?.status === "active" && !isScheduledLocked);
  const backgroundParticles = Array.from({ length: 22 }, (_, index) => ({
    id: index,
    size: 8 + (index % 5) * 6,
    left: `${(index * 9) % 100}%`,
    top: `${(index * 13) % 100}%`,
    delay: index * 0.18
  }));

  async function handleCountdownComplete() {
    if (!password.trim()) {
      return;
    }

    await unlockWish(undefined, { password });
  }

  return (
    <>
      <Helmet>
        <title>
          {wish?.recipientName || meta?.recipientName || "Birthday Wish"} | Birthday Glow
        </title>
      </Helmet>

      <section className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#5b21b633,transparent_24%),radial-gradient(circle_at_right,#ec489933,transparent_22%),radial-gradient(circle_at_bottom,#0ea5e933,transparent_24%),linear-gradient(135deg,#040712,#130a25,#08142d)] px-4 py-8 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute inset-0">
          {backgroundParticles.map((particle) => (
            <motion.span
              key={particle.id}
              className="absolute rounded-full bg-white/20 blur-[1px]"
              style={{
                width: particle.size,
                height: particle.size,
                left: particle.left,
                top: particle.top
              }}
              animate={{ y: [0, -28, 0], opacity: [0.25, 0.7, 0.25] }}
              transition={{ repeat: Infinity, duration: 5 + particle.id * 0.15, delay: particle.delay }}
            />
          ))}
        </div>

        <div className="relative mx-auto max-w-7xl">
        {loadingMeta ? (
          <div className="glass-panel px-6 py-8 text-white/70">Preparing this birthday surprise...</div>
        ) : loadError ? (
          <div className="glass-panel p-8">
            <div className="flex items-center gap-3 text-amber-200">
              <AlertTriangle className="h-5 w-5" />
              <span>Unable to open this wish</span>
            </div>
            <p className="mt-4 text-white/65">{loadError}</p>
          </div>
        ) : wish && canOpenWish ? (
          <WishViewer
            wish={wish}
            mode="public"
            shareUrl={`${window.location.origin}/wish/${slug}`}
            allowShare
          />
        ) : (
          <div className="grid min-h-[88vh] items-center gap-8 xl:grid-cols-[minmax(0,1.15fr)_420px]">
            <motion.div
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="glass-panel relative overflow-hidden p-8 sm:p-10"
            >
              <div className={`absolute inset-x-0 top-0 h-64 bg-gradient-to-br ${template.halo} opacity-80`} />
              <div className="relative z-10">
                <span className="badge">Birthday countdown</span>
                <h1 className="mt-6 max-w-4xl text-5xl font-semibold leading-tight text-white sm:text-6xl">
                  {isScheduledLocked
                    ? `A magical surprise for ${meta?.recipientName} unlocks soon`
                    : `A private wish for ${meta?.recipientName}`}
                </h1>
                <p className="mt-4 max-w-3xl text-lg leading-8 text-white/68">
                  A premium birthday story is waiting behind this link. The countdown builds the moment, and the full celebration opens right on time.
                </p>

                <div className="mt-10">
                  <CountdownTimer targetDate={countdownTarget} onComplete={handleCountdownComplete} />
                </div>

                <div className="mt-10 flex flex-wrap gap-3">
                  {template.features.map((feature) => (
                    <span
                      key={feature}
                      className="rounded-full border border-white/10 bg-slate-950/55 px-4 py-2 text-sm text-white/70"
                    >
                      {feature}
                    </span>
                  ))}
                </div>

                <div className="mt-10 grid gap-4 md:grid-cols-3">
                  <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/55 p-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-white/45">Template</p>
                    <p className="mt-2 text-lg font-medium text-white">{template.shortLabel}</p>
                  </div>
                  <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/55 p-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-white/45">Relation</p>
                    <p className="mt-2 text-lg font-medium text-white">{meta?.relation}</p>
                  </div>
                  <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/55 p-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-white/45">Unlocks</p>
                    <p className="mt-2 text-lg font-medium text-white">
                      {formatDateTime(countdownTarget) || expiresLabel || "Soon"}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            <div className="space-y-6">
              <motion.form
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                onSubmit={unlockWish}
                className="glass-panel p-6"
              >
                <div className="flex items-center gap-3 text-cyan-100">
                  <LockKeyhole className="h-5 w-5" />
                  <span>Password required</span>
                </div>
                <p className="mt-4 text-white/60">
                  Enter the password shared with you. If the birthday moment hasn’t arrived yet, you’ll see the live countdown first.
                </p>

                <label className="mt-6 block space-y-2">
                  <span className="field-label">Access password</span>
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="field-input"
                    placeholder="Enter password"
                  />
                </label>

                <button
                  type="submit"
                  disabled={unlocking || isExpired}
                  className="button-primary mt-6 w-full justify-center"
                >
                  {unlocking ? "Unlocking..." : "Unlock Birthday Link"}
                </button>
              </motion.form>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.16 }}
                className="glass-panel p-6"
              >
                <div className="flex items-center gap-3 text-white/80">
                  {isScheduledLocked ? <Sparkles className="h-5 w-5 text-fuchsia-200" /> : <TimerReset className="h-5 w-5 text-amber-200" />}
                  <span>Status</span>
                </div>
                <p className="mt-4 text-white/65">
                  {isExpired
                    ? "This birthday page has expired after its 24-hour celebration window."
                    : isScheduledLocked
                      ? "The link can be opened now, but the full wish stays hidden until the birthday countdown finishes."
                      : "Once the timer completes, the premium 3D birthday scene will fade in automatically."}
                </p>
                {expiresLabel ? (
                  <p className="mt-4 text-sm text-white/55">Available until {expiresLabel}</p>
                ) : null}
              </motion.div>
            </div>
          </div>
        )}
        </div>
      </section>
    </>
  );
}

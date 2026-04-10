import { AlertTriangle, LockKeyhole, TimerReset } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Helmet } from "react-helmet-async";
import { useParams } from "react-router-dom";
import api, { extractErrorMessage } from "../api/http.js";
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

  async function unlockWish(event) {
    event.preventDefault();

    if (!password.trim()) {
      toast.error("Enter the password to open this birthday wish.");
      return;
    }

    setUnlocking(true);

    try {
      const response = await api.post(`/wishes/public/access/${slug}`, {
        password
      });

      setWish(response.data.data.wish);
      toast.success("Birthday wish unlocked.");
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setUnlocking(false);
    }
  }

  const template = getBirthdayTemplate(meta?.templateId || wish?.templateId);
  const expiresLabel = useMemo(() => formatDateTime(meta?.expiresAt || wish?.expiresAt), [meta?.expiresAt, wish?.expiresAt]);
  const isExpired = Boolean(meta?.expiresAt && new Date(meta.expiresAt) <= new Date());
  const isInactive = Boolean(meta && meta.status !== "active" && meta.status !== "expired" && !wish);

  return (
    <>
      <Helmet>
        <title>
          {wish?.recipientName || meta?.recipientName || "Birthday Wish"} | Birthday Glow
        </title>
      </Helmet>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
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
        ) : wish ? (
          <WishViewer
            wish={wish}
            mode="public"
            shareUrl={`${window.location.origin}/wish/${slug}`}
            allowShare
          />
        ) : (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
            <div className="glass-panel overflow-hidden p-0">
              <div className={`h-44 bg-gradient-to-br ${template.halo}`} />
              <div className="space-y-6 p-6 sm:p-8">
                <div>
                  <span className="badge">Private birthday wish</span>
                  <h1 className="mt-4 text-4xl font-semibold text-white sm:text-5xl">
                    A surprise for {meta?.recipientName}
                  </h1>
                  <p className="mt-3 max-w-2xl text-white/65">
                    This page uses the {template.label.toLowerCase()} and opens only after password validation.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-white/45">Template</p>
                    <p className="mt-2 text-lg font-medium text-white">{template.shortLabel}</p>
                  </div>
                  <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-white/45">Relation</p>
                    <p className="mt-2 text-lg font-medium text-white">{meta?.relation}</p>
                  </div>
                  <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-white/45">Availability</p>
                    <p className="mt-2 text-lg font-medium text-white">
                      {expiresLabel || "Unlock to view"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {template.features.map((feature) => (
                    <span
                      key={feature}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/65"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <form onSubmit={unlockWish} className="glass-panel p-6">
                <div className="flex items-center gap-3 text-cyan-100">
                  <LockKeyhole className="h-5 w-5" />
                  <span>Password required</span>
                </div>
                <p className="mt-4 text-white/60">
                  Enter the password shared with you to unlock the interactive 3D birthday page.
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
                  disabled={unlocking || isExpired || isInactive}
                  className="button-primary mt-6 w-full justify-center"
                >
                  {unlocking ? "Unlocking..." : "Open Birthday Wish"}
                </button>
              </form>

              <div className="glass-panel p-6">
                <div className="flex items-center gap-3 text-white/80">
                  <TimerReset className="h-5 w-5 text-amber-200" />
                  <span>Status</span>
                </div>
                <p className="mt-4 text-white/65">
                  {isExpired
                    ? "This birthday page has expired after its 24-hour celebration window."
                    : isInactive
                      ? "This wish is not active yet. It may be scheduled to open later."
                      : "Once unlocked, the page opens with music, message animation, and the interactive 3D scene."}
                </p>
                {expiresLabel ? (
                  <p className="mt-4 text-sm text-white/55">Available until {expiresLabel}</p>
                ) : null}
              </div>
            </div>
          </div>
        )}
      </section>
    </>
  );
}

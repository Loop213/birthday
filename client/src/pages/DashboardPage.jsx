import { CalendarClock, Copy, ExternalLink, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import api, { extractErrorMessage } from "../api/http.js";
import { useAuth } from "../context/AuthContext.jsx";

function formatCurrency(amount) {
  return `Rs.${(amount / 100).toFixed(2)}`;
}

function formatDate(value) {
  if (!value) {
    return "Not scheduled";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [wishes, setWishes] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadWishes() {
    try {
      const response = await api.get("/wishes");
      setWishes(response.data.data);
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadWishes();
  }, []);

  async function removeWish(id) {
    try {
      await api.delete(`/wishes/${id}`);
      toast.success("Wish deleted.");
      setWishes((current) => current.filter((wish) => wish._id !== id));
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  }

  async function copyShareLink(slug) {
    const link = `${window.location.origin}/wish/${slug}`;
    await navigator.clipboard.writeText(link);
    toast.success("Link copied.");
  }

  const stats = {
    total: wishes.length,
    active: wishes.filter((wish) => wish.status === "active").length,
    scheduled: wishes.filter((wish) => wish.status === "scheduled").length,
    drafts: wishes.filter((wish) => wish.status === "draft" || wish.status === "pending_payment").length
  };

  return (
    <>
      <Helmet>
        <title>Dashboard | Birthday Glow</title>
      </Helmet>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="badge">Creator dashboard</span>
              <h1 className="mt-4 text-4xl font-semibold text-white sm:text-5xl">
                Welcome back, {user?.name}
              </h1>
              <p className="mt-3 max-w-2xl text-white/60">
                Manage drafts, launch premium links, and keep every birthday surprise on schedule.
              </p>
            </div>
            <Link to="/dashboard/create" className="button-primary">
              <Plus className="h-4 w-4" />
              Create Birthday Page
            </Link>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {[
              ["Total wishes", stats.total],
              ["Active links", stats.active],
              ["Scheduled", stats.scheduled],
              ["Drafts", stats.drafts]
            ].map(([label, value]) => (
              <div key={label} className="stat-card">
                <p className="text-sm uppercase tracking-[0.22em] text-white/45">{label}</p>
                <p className="mt-4 text-4xl font-semibold text-white">{value}</p>
              </div>
            ))}
          </div>

          {loading ? (
            <div className="glass-panel px-6 py-8 text-white/70">Loading your birthday pages...</div>
          ) : wishes.length === 0 ? (
            <div className="glass-panel flex flex-col items-start gap-5 px-8 py-10">
              <p className="text-2xl font-semibold text-white">No wishes yet</p>
              <p className="max-w-xl text-white/60">
                Create the first page to preview the 3D experience, apply a coupon, and unlock the shareable link.
              </p>
              <button type="button" onClick={() => navigate("/dashboard/create")} className="button-primary">
                Start a Birthday Project
              </button>
            </div>
          ) : (
            <div className="grid gap-5 xl:grid-cols-2">
              {wishes.map((wish) => (
                <article key={wish._id} className="glass-panel p-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="badge">{wish.theme}</span>
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/55">
                          {wish.status}
                        </span>
                      </div>
                      <h2 className="mt-4 text-2xl font-semibold text-white">
                        {wish.recipientName}
                      </h2>
                      <p className="mt-1 text-white/55">{wish.relation}</p>
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-slate-950/60 px-4 py-3 text-right">
                      <p className="text-xs uppercase tracking-[0.22em] text-white/45">Price</p>
                      <p className="mt-2 text-xl font-semibold text-white">
                        {formatCurrency(wish.priceBreakdown?.finalAmount || 1000)}
                      </p>
                    </div>
                  </div>

                  <p className="mt-5 line-clamp-3 text-white/65">
                    {wish.message || "No custom message added yet."}
                  </p>

                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    <div className="rounded-3xl border border-white/10 bg-white/5 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.22em] text-white/45">Delivery</p>
                      <div className="mt-2 flex items-center gap-2 text-white/75">
                        <CalendarClock className="h-4 w-4 text-cyan-200" />
                        <span>{formatDate(wish.scheduleAt)}</span>
                      </div>
                    </div>
                    <div className="rounded-3xl border border-white/10 bg-white/5 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.22em] text-white/45">Password</p>
                      <p className="mt-2 text-white/75">Use the password you set while creating this page.</p>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link to={`/dashboard/preview/${wish._id}`} className="button-primary">
                      Preview / Pay
                    </Link>
                    {wish.shareSlug ? (
                      <>
                        <button
                          type="button"
                          onClick={() => copyShareLink(wish.shareSlug)}
                          className="button-secondary"
                        >
                          <Copy className="h-4 w-4" />
                          Copy Link
                        </button>
                        <a
                          href={`/wish/${wish.shareSlug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="button-secondary"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Open
                        </a>
                      </>
                    ) : null}
                    <button type="button" onClick={() => removeWish(wish._id)} className="button-secondary">
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

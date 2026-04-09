import { ArrowRight, CheckCircle2, Gift, ShieldCheck, Sparkles, Wallet } from "lucide-react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import HeroExperience from "../components/three/HeroExperience.jsx";

const features = [
  {
    icon: Sparkles,
    title: "Immersive 3D wish pages",
    description: "Three.js-powered scenes with floating balloons, animated hero moments, confetti, and cinematic reveals."
  },
  {
    icon: ShieldCheck,
    title: "Private by design",
    description: "Every wish gets a protected URL and password with automatic 24-hour expiry after activation."
  },
  {
    icon: Wallet,
    title: "Monetized flow",
    description: "Preview for free, apply coupons, complete payment, and share the premium page for just Rs.10."
  },
  {
    icon: Gift,
    title: "Memory-rich storytelling",
    description: "Pair photos, music, shayari, voice notes, and relationship-based themes into one elegant experience."
  }
];

const steps = [
  "Create a draft with message, theme, media, password, and birthday schedule.",
  "Preview the full immersive page before unlocking the paid share link.",
  "Pay securely, apply coupons, then share manually or auto-send at midnight."
];

export default function HomePage() {
  return (
    <>
      <Helmet>
        <title>Birthday Glow | 3D Birthday Wishes Platform</title>
        <meta
          name="description"
          content="Create premium 3D birthday wish pages with music, photos, scheduling, password protection, coupons, and admin moderation."
        />
      </Helmet>

      <section className="mx-auto max-w-7xl px-4 pb-16 pt-28 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-7"
          >
            <span className="badge">Premium birthday pages with startup polish</span>
            <div className="space-y-5">
              <h1 className="max-w-3xl text-5xl font-semibold leading-tight text-white sm:text-6xl">
                Turn a birthday wish into a glowing, password-protected 3D celebration.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-white/70">
                Birthday Glow lets creators build cinematic wish pages with visuals, music, voice notes, admin-backed commerce, and beautiful shareable experiences.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Link to="/signup" className="button-primary">
                Build Your First Wish
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/login" className="button-secondary">
                Open Dashboard
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                ["3D reveal", "Animated cake, balloons, confetti"],
                ["Rs.10 link", "Preview before payment"],
                ["24h expiry", "Auto deactivate after celebration"]
              ].map(([title, text]) => (
                <div key={title} className="glass-panel p-4">
                  <p className="text-lg font-semibold text-white">{title}</p>
                  <p className="mt-1 text-sm text-white/60">{text}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.15 }}
          >
            <HeroExperience />
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="badge">Why it feels premium</span>
            <h2 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">
              The product is designed like a small celebration startup, not a class assignment.
            </h2>
          </div>
          <p className="max-w-2xl text-white/60">
            Built for polished storytelling, modern payments, scheduled delivery, and admin control.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="glass-panel p-6"
              >
                <span className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-cyan-200">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
                <p className="mt-3 text-sm leading-7 text-white/60">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="glass-panel p-8">
            <span className="badge">Creator flow</span>
            <h3 className="mt-4 text-3xl font-semibold text-white">From draft to midnight delivery</h3>
            <div className="mt-8 space-y-5">
              {steps.map((step, index) => (
                <div key={step} className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm font-semibold text-cyan-100">
                    {index + 1}
                  </div>
                  <p className="pt-2 text-white/70">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="glass-panel p-7">
              <p className="text-sm uppercase tracking-[0.28em] text-cyan-200/80">Pricing</p>
              <p className="mt-4 text-5xl font-semibold text-white">Rs.10</p>
              <p className="mt-2 text-white/60">Per published birthday link with preview, scheduling, coupons, and admin-backed security.</p>
              <div className="mt-6 space-y-3">
                {[
                  "Preview before payment",
                  "Coupon code support",
                  "Manual and scheduled sharing"
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 text-white/75">
                    <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-panel p-7">
              <p className="text-sm uppercase tracking-[0.28em] text-fuchsia-200/80">Admin suite</p>
              <p className="mt-4 text-2xl font-semibold text-white">Moderation, revenue, and user controls</p>
              <p className="mt-3 text-white/60">
                Admins track revenue, create coupons, block users, and remove inappropriate content from one dashboard.
              </p>
              <Link to="/signup" className="mt-6 inline-flex text-sm font-medium text-cyan-200">
                Start building now
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

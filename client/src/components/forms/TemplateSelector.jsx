import { motion } from "framer-motion";
import clsx from "clsx";
import { ArrowRight, CakeSlice, Gift, Heart, Image, PartyPopper, Sparkles } from "lucide-react";
import { birthdayTemplates } from "../../data/templates.js";

const iconMap = {
  birthday: Gift,
  "cake-celebration": CakeSlice,
  "balloon-sky": Sparkles,
  "romantic-love": Heart,
  "fireworks-party": PartyPopper,
  "family-warmth": Image
};

export default function TemplateSelector({ selectedTemplateId, onSelect }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="badge">Step 1</span>
          <h2 className="mt-4 text-3xl font-semibold text-white">Choose a 3D template</h2>
          <p className="mt-2 max-w-3xl text-white/60">
            Start with the stage, then personalize the name, images, music, and message around it.
          </p>
        </div>
        <p className="max-w-sm text-sm text-white/45">
          Each template is interactive and reusable, so new scenes can be added without rewriting the checkout flow.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {birthdayTemplates.map((template, index) => {
          const Icon = iconMap[template.id];
          const isSelected = selectedTemplateId === template.id;

          return (
            <motion.button
              key={template.id}
              type="button"
              onClick={() => onSelect(template.id)}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={clsx(
                "group glass-panel relative overflow-hidden p-6 text-left transition",
                isSelected
                  ? "border-cyan-300/35 bg-cyan-300/10 shadow-pink"
                  : "hover:border-white/20 hover:bg-white/[0.06]"
              )}
            >
              <div className={clsx("absolute inset-x-0 top-0 h-28 bg-gradient-to-br opacity-90", template.halo)} />
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/60 text-cyan-100">
                    <Icon className="h-5 w-5" />
                  </span>
                  {isSelected ? (
                    <span className="rounded-full border border-cyan-200/20 bg-cyan-200/10 px-3 py-1 text-xs uppercase tracking-[0.22em] text-cyan-100">
                      Selected
                    </span>
                  ) : null}
                </div>

                <h3 className="mt-16 text-xl font-semibold text-white">{template.label}</h3>
                <p className="mt-3 text-sm leading-7 text-white/60">{template.description}</p>

                <div className="mt-5 flex flex-wrap gap-2">
                  {template.features.map((feature) => (
                    <span
                      key={feature}
                      className="rounded-full border border-white/10 bg-slate-950/60 px-3 py-1 text-xs text-white/65"
                    >
                      {feature}
                    </span>
                  ))}
                </div>

                <div className="mt-6 flex items-center gap-2 text-sm font-medium text-cyan-100">
                  <ArrowRight className="h-4 w-4" />
                  {template.interactionHint}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

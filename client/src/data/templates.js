export const birthdayTemplates = [
  {
    id: "cake-celebration",
    label: "Cake Celebration Scene",
    shortLabel: "Cake Celebration",
    description: "Rotating cake, candle flames, and a dramatic 3D name reveal.",
    interactionHint: "Tap the cake to blow out the candles.",
    accent: "#ff8fb8",
    glow: "#ffd166",
    halo: "from-rose-400/30 via-amber-300/25 to-transparent",
    defaultTheme: "party",
    defaultMusicPreset: "celebration-dream",
    features: ["Rotating cake", "Candle flame animation", "Blow candles interaction"]
  },
  {
    id: "balloon-sky",
    label: "Balloon Sky Theme",
    shortLabel: "Balloon Sky",
    description: "Floating balloons in a dreamy sky with burst-on-click celebration.",
    interactionHint: "Tap balloons to pop them with confetti.",
    accent: "#4bf4ff",
    glow: "#7ea6ff",
    halo: "from-cyan-300/35 via-sky-300/20 to-transparent",
    defaultTheme: "funny",
    defaultMusicPreset: "sky-drift",
    features: ["Floating balloon physics", "Burst animation", "Moving cloud backdrop"]
  },
  {
    id: "romantic-love",
    label: "Romantic Love Theme",
    shortLabel: "Romantic Love",
    description: "Heart particles, silhouette couple stage, and cinematic love text.",
    interactionHint: "Let the hearts drift while the message unfolds.",
    accent: "#ff4ecd",
    glow: "#ff9ac9",
    halo: "from-fuchsia-400/35 via-pink-300/20 to-transparent",
    defaultTheme: "romantic",
    defaultMusicPreset: "moonlight-vows",
    features: ["Heart particles", "Couple silhouette animation", "\"I Love You\" reveal"]
  },
  {
    id: "fireworks-party",
    label: "Fireworks Party Theme",
    shortLabel: "Fireworks Party",
    description: "Night-sky party scene with burst fireworks on every click.",
    interactionHint: "Tap anywhere to trigger a fireworks blast.",
    accent: "#7cf5b3",
    glow: "#ff9f1c",
    halo: "from-emerald-300/30 via-orange-300/25 to-transparent",
    defaultTheme: "party",
    defaultMusicPreset: "party-thunder",
    features: ["Night sky party", "Interactive fireworks", "Festival energy"]
  },
  {
    id: "family-warmth",
    label: "Family Theme",
    shortLabel: "Family Warmth",
    description: "Warm lighting, framed memories, and an emotional family stage.",
    interactionHint: "Your uploaded images appear as framed memories.",
    accent: "#ffd166",
    glow: "#ffb703",
    halo: "from-amber-300/35 via-orange-200/20 to-transparent",
    defaultTheme: "family",
    defaultMusicPreset: "homecoming-notes",
    features: ["Warm lighting", "Photo gallery frames", "Emotional ambience"]
  }
];

export const birthdayTemplateMap = Object.fromEntries(
  birthdayTemplates.map((template) => [template.id, template])
);

export function getBirthdayTemplate(templateId) {
  return birthdayTemplateMap[templateId] || birthdayTemplates[0];
}

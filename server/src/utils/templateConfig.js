export const TEMPLATE_IDS = [
  "birthday",
  "cake-celebration",
  "balloon-sky",
  "romantic-love",
  "fireworks-party",
  "family-warmth"
];

export const TEMPLATE_THEME_MAP = {
  birthday: "party",
  "cake-celebration": "party",
  "balloon-sky": "funny",
  "romantic-love": "romantic",
  "fireworks-party": "party",
  "family-warmth": "family"
};

export const TEMPLATE_MUSIC_MAP = {
  birthday: "celebration-dream",
  "cake-celebration": "celebration-dream",
  "balloon-sky": "sky-drift",
  "romantic-love": "moonlight-vows",
  "fireworks-party": "party-thunder",
  "family-warmth": "homecoming-notes"
};

export function resolveTemplateTheme(templateId) {
  return TEMPLATE_THEME_MAP[templateId] || "party";
}

export function resolveTemplateId(templateId) {
  return TEMPLATE_IDS.includes(templateId) ? templateId : "cake-celebration";
}

export function resolveTemplateMusicPreset(templateId) {
  return TEMPLATE_MUSIC_MAP[resolveTemplateId(templateId)] || "celebration-dream";
}

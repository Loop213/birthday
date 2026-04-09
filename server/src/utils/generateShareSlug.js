import crypto from "crypto";

export function generateShareSlug(length = 8) {
  return crypto
    .randomBytes(Math.ceil(length))
    .toString("base64url")
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, length)
    .toLowerCase();
}

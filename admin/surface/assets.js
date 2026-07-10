import { CONFIG } from "@/config.js";

// Local preview overrides for freshly-uploaded-but-not-yet-committed assets:
// path -> data URL. Lets a new image show immediately, before it's on the live
// site. Cleared/kept by the app; survives until page reload.
const overrides = new Map();
export function setAssetOverride(path, url) {
  overrides.set(path, url);
}

// Resolve a stored asset path (e.g. "assets/x.jpg") to a displayable URL.
// Already-absolute / data / blob URLs pass through unchanged.
export function assetUrl(path) {
  if (!path) return "";
  if (overrides.has(path)) return overrides.get(path);
  if (/^(https?:|data:|blob:)/i.test(path)) return path;
  return CONFIG.siteOrigin + "/" + String(path).replace(/^\/+/, "");
}

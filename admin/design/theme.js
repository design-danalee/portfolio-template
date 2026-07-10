// Apply a theme to the ADMIN document live, so the editing surface previews
// exactly what base.njk renders on the published site. Four text styles
// (Display / Heading / Body / Caption), each with its own font + size.
import { assetUrl } from "@/surface/assets.js";

export const THEME_FILE = "src/_data/theme.json";

const STYLE_KEYS = ["display", "heading", "body", "caption"];

// Used when theme.json is absent (fresh template / not yet saved).
export const DEFAULT_THEME = {
  styles: {
    display: { font: "Instrument Serif", fontQuery: "Instrument+Serif:ital@1", size: 4.2, tracking: 0 },
    heading: { font: "Schibsted Grotesk", fontQuery: "Schibsted+Grotesk", size: 1.85, tracking: 0 },
    body: { font: "Schibsted Grotesk", fontQuery: "Schibsted+Grotesk", size: 1.2, tracking: 0 },
    caption: { font: "Schibsted Grotesk", fontQuery: "Schibsted+Grotesk", size: 1.0, tracking: 0 },
  },
  colors: { bg: "#ffffff", text: "#111827", accent: "#000000" },
  customFonts: [],
};

export function applyTheme(theme) {
  const root = document.documentElement;
  const s = theme.styles || {};
  STYLE_KEYS.forEach((key) => {
    const st = s[key] || {};
    root.style.setProperty(`--font-${key}`, `"${st.font || ""}"`);
    root.style.setProperty(`--size-${key}`, `${st.size ?? 1}rem`);
    root.style.setProperty(`--tracking-${key}`, `${st.tracking ?? 0}em`);
  });
  // Admin preview is desktop-scale; pin the responsive knob so .t-* calc()s
  // always resolve (the media-query overrides only matter on the live site).
  root.style.setProperty("--type-shrink", "1");
  root.style.setProperty("--color-bg", theme.colors?.bg || "#ffffff");
  root.style.setProperty("--color-text", theme.colors?.text || "#111827");
  root.style.setProperty("--color-accent", theme.colors?.accent || "#000000");

  const queries = [
    ...new Set(STYLE_KEYS.map((k) => s[k] && s[k].fontQuery).filter(Boolean)),
  ];
  ensureGoogle(queries);
  ensureCustom(theme.customFonts || []);
}

function ensureGoogle(queries) {
  let link = document.getElementById("admin-google-fonts");
  if (!queries.length) {
    if (link) link.href = "";
    return;
  }
  if (!link) {
    link = document.createElement("link");
    link.id = "admin-google-fonts";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }
  link.href =
    "https://fonts.googleapis.com/css2?" +
    queries.map((q) => "family=" + q).join("&") +
    "&display=swap";
}

function ensureCustom(customFonts) {
  let el = document.getElementById("admin-custom-fonts");
  if (!el) {
    el = document.createElement("style");
    el.id = "admin-custom-fonts";
    document.head.appendChild(el);
  }
  el.textContent = customFonts
    .map(
      (cf) =>
        `@font-face{font-family:"${cf.name}";src:url("${assetUrl(
          cf.file
        )}") format("${cf.format}");font-display:swap;}`
    )
    .join("\n");
}

export function serializeTheme(theme) {
  return JSON.stringify(theme, null, 2) + "\n";
}

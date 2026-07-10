// Apply a theme to the ADMIN document live, so the editing surface previews
// exactly what base.njk will render on the published site.
const THEME_FILE = "src/_data/theme.json";
export { THEME_FILE };

// Used when theme.json is absent (fresh template / not yet saved).
export const DEFAULT_THEME = {
  fontDisplay: "Instrument Serif",
  fontDisplayQuery: "Instrument+Serif:ital@1",
  fontBody: "Schibsted Grotesk",
  fontBodyQuery: "Schibsted+Grotesk",
  textScale: 1,
  colors: { bg: "#ffffff", text: "#111827", accent: "#000000" },
};

export function applyTheme(theme) {
  const root = document.documentElement;
  root.style.setProperty("--font-display", `"${theme.fontDisplay}"`);
  root.style.setProperty("--font-body", `"${theme.fontBody}"`);
  root.style.setProperty("--text-scale", String(theme.textScale ?? 1));
  root.style.setProperty("--color-bg", theme.colors?.bg || "#ffffff");
  root.style.setProperty("--color-text", theme.colors?.text || "#111827");
  root.style.setProperty("--color-accent", theme.colors?.accent || "#000000");
  // Match base.njk's `html { font-size: calc(100% * var(--text-scale)) }`.
  root.style.fontSize = `calc(100% * ${theme.textScale ?? 1})`;
  // Load the chosen Google Fonts (queries are stored on the theme).
  ensureFontLink(theme.fontDisplayQuery, theme.fontBodyQuery);
}

function ensureFontLink(dq, bq) {
  let link = document.getElementById("admin-theme-fonts");
  if (!link) {
    link = document.createElement("link");
    link.id = "admin-theme-fonts";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }
  link.href = `https://fonts.googleapis.com/css2?family=${dq}&family=${bq}&display=swap`;
}

export function serializeTheme(theme) {
  return JSON.stringify(theme, null, 2) + "\n";
}

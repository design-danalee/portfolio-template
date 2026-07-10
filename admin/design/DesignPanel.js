// In-CMS Design panel: fonts, text size, colors. Edits update theme.json and
// apply live (applyTheme runs on every change via the parent).
import { html } from "@/lib.js";
import { FONTS, fontByName } from "@/design/fonts.js";

function FontSelect({ label, value, onPick }) {
  return html`<label class="design-row">
    <span class="design-label">${label}</span>
    <select
      class="design-select"
      value=${value}
      onChange=${(e) => onPick(e.target.value)}
    >
      ${FONTS.map(
        (f) => html`<option value=${f.name}>${f.name} · ${f.category}</option>`
      )}
    </select>
  </label>`;
}

function ColorRow({ label, value, onInput }) {
  return html`<label class="design-row">
    <span class="design-label">${label}</span>
    <span class="design-color">
      <input type="color" value=${value} onInput=${(e) => onInput(e.target.value)} />
      <code>${value}</code>
    </span>
  </label>`;
}

export function DesignPanel({ theme, update }) {
  const setFont = (slot) => (name) => {
    const f = fontByName(name);
    if (!f) return;
    if (slot === "display")
      update({ fontDisplay: f.name, fontDisplayQuery: f.query });
    else update({ fontBody: f.name, fontBodyQuery: f.query });
  };
  const setColor = (key) => (val) =>
    update({ colors: { ...theme.colors, [key]: val } });

  const pct = Math.round((theme.textScale ?? 1) * 100);

  return html`<div class="design-panel">
    <div class="design-controls">
      <h2>Design</h2>
      <p class="design-intro">Changes preview live and apply to your whole site when you Save.</p>

      <h3>Fonts</h3>
      <${FontSelect} label="Headings" value=${theme.fontDisplay} onPick=${setFont("display")} />
      <${FontSelect} label="Body text" value=${theme.fontBody} onPick=${setFont("body")} />

      <h3>Text size</h3>
      <label class="design-row">
        <span class="design-label">Scale (${pct}%)</span>
        <input
          type="range" min="0.8" max="1.4" step="0.05"
          value=${theme.textScale ?? 1}
          onInput=${(e) => update({ textScale: Number(e.target.value) })}
        />
      </label>

      <h3>Colors</h3>
      <${ColorRow} label="Background" value=${theme.colors.bg} onInput=${setColor("bg")} />
      <${ColorRow} label="Text" value=${theme.colors.text} onInput=${setColor("text")} />
      <${ColorRow} label="Accent" value=${theme.colors.accent} onInput=${setColor("accent")} />
    </div>

    <div class="design-preview">
      <p class="design-preview-label">Preview</p>
      <div class="design-preview-card">
        <h1 class="hero-text">The quick brown fox</h1>
        <p>
          Body copy previews here in your chosen font and size. Jackdaws love my
          big sphinx of quartz — the five boxing wizards jump quickly.
        </p>
        <button class="submit-btn" type="button"><span>Accent button</span></button>
      </div>
    </div>
  </div>`;
}

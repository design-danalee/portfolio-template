// In-CMS Design panel: 4 text styles (Display/Heading/Body/Caption), each with
// its own font (curated Google list + uploaded custom fonts) and size, plus
// site colors. Edits apply live (parent runs applyTheme on every change).
import { html } from "@/lib.js";
import { FONTS, fontByName } from "@/design/fonts.js";

const STYLES = [
  { key: "display", label: "Display / hero", min: 2, max: 7 },
  { key: "heading", label: "Heading", min: 1.2, max: 4 },
  { key: "body", label: "Body", min: 0.85, max: 2 },
  { key: "caption", label: "Caption / meta", min: 0.7, max: 1.6 },
];

function StyleRow({ style, def, customFonts, onFont, onSize }) {
  const size = style.size ?? 1;
  return html`<div class="design-style">
    <div class="design-style-head">${def.label}</div>
    <label class="design-row">
      <span class="design-label">Font</span>
      <select class="design-select" value=${style.font} onChange=${(e) => onFont(e.target.value)}>
        <optgroup label="Google Fonts">
          ${FONTS.map((f) => html`<option value=${f.name}>${f.name} · ${f.category}</option>`)}
        </optgroup>
        ${customFonts.length
          ? html`<optgroup label="Your fonts">
              ${customFonts.map((f) => html`<option value=${f.name}>${f.name} · custom</option>`)}
            </optgroup>`
          : null}
      </select>
    </label>
    <label class="design-row">
      <span class="design-label">Size (${size}rem)</span>
      <input
        type="range" min=${def.min} max=${def.max} step="0.05"
        value=${size}
        onInput=${(e) => onSize(Number(e.target.value))}
      />
    </label>
  </div>`;
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

export function DesignPanel({ theme, update, onUploadFont }) {
  const customFonts = theme.customFonts || [];
  const setFont = (key) => (name) => {
    const curated = fontByName(name);
    const fontQuery = curated ? curated.query : ""; // custom fonts load via @font-face
    update({ style: key, patch: { font: name, fontQuery } });
  };
  const setSize = (key) => (size) => update({ style: key, patch: { size } });
  const setColor = (k) => (val) => update({ color: k, value: val });

  return html`<div class="design-panel">
    <div class="design-controls">
      <h2>Design</h2>
      <p class="design-intro">Set the font & size for each text style. Changes preview live and apply site-wide when you Save.</p>

      <h3>Text styles</h3>
      ${STYLES.map(
        (def) => html`<${StyleRow}
          def=${def}
          style=${theme.styles[def.key]}
          customFonts=${customFonts}
          onFont=${setFont(def.key)}
          onSize=${setSize(def.key)}
        />`
      )}
      <button class="design-upload" onClick=${onUploadFont}>⬆ Upload a font file…</button>
      <p class="design-hint">.woff2, .woff, .ttf or .otf — it becomes selectable above for any style.</p>

      <h3>Colors</h3>
      <${ColorRow} label="Background" value=${theme.colors.bg} onInput=${setColor("bg")} />
      <${ColorRow} label="Text" value=${theme.colors.text} onInput=${setColor("text")} />
      <${ColorRow} label="Accent" value=${theme.colors.accent} onInput=${setColor("accent")} />
    </div>

    <div class="design-preview">
      <p class="design-preview-label">Preview</p>
      <div class="design-preview-card">
        <div class="t-display">Display heading</div>
        <div class="t-heading" style="margin-top:14px">Section heading</div>
        <p class="t-body" style="margin-top:10px">
          Body copy previews here. Jackdaws love my big sphinx of quartz; the five
          boxing wizards jump quickly.
        </p>
        <div class="t-caption" style="margin-top:8px; opacity:.7">Caption / metadata line</div>
        <button class="submit-btn" type="button" style="margin-top:16px"><span>Accent button</span></button>
      </div>
    </div>
  </div>`;
}

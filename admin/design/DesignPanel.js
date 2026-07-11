// In-CMS Design panel: 4 text styles (Display/Heading/Body/Caption), each with
// its own font, size, and letter-spacing, plus a per-style Reset and a default
// marker on each slider. Site colors are global. Edits apply live.
import { html } from "@/lib.js";
import { FONTS, fontByName } from "@/design/fonts.js";
import { DEFAULT_THEME } from "@/design/theme.js";
import { assetUrl } from "@/surface/assets.js";

const STYLES = [
  { key: "display", label: "Display / hero", min: 2, max: 7 },
  { key: "heading", label: "Heading", min: 1.2, max: 4 },
  { key: "body", label: "Body", min: 0.85, max: 2 },
  { key: "caption", label: "Caption / meta", min: 0.7, max: 1.6 },
];
const TRACK_MIN = -0.05;
const TRACK_MAX = 0.2;

// A range slider with a vertical tick marking the built-in default value.
// Stacked: label above, full-width track below (per mockup).
function Slider({ label, min, max, step, value, def, onInput }) {
  const pct = Math.max(0, Math.min(100, ((def - min) / (max - min)) * 100));
  return html`<label class="design-slider">
    <span class="design-label">${label}</span>
    <span class="slider-wrap">
      <input
        type="range" min=${min} max=${max} step=${step} value=${value}
        onInput=${(e) => onInput(Number(e.target.value))}
      />
      <span class="slider-tick" title="Default" style=${`left:${pct}%`}></span>
    </span>
  </label>`;
}

function StyleRow({ def, style, defaults, customFonts, onFont, onSize, onTrack, onReset }) {
  const size = style.size ?? 1;
  const tracking = style.tracking ?? 0;
  return html`<div class="design-style">
    <div class="design-style-head">
      <span>${def.label}</span>
      <button class="design-reset" title="Reset to default" onClick=${onReset}>↺ Reset</button>
    </div>
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
    <${Slider}
      label=${`Size (${size}rem)`}
      min=${def.min} max=${def.max} step="0.05"
      value=${size} def=${defaults.size} onInput=${onSize}
    />
    <${Slider}
      label=${`Letter spacing (${tracking}em)`}
      min=${TRACK_MIN} max=${TRACK_MAX} step="0.005"
      value=${tracking} def=${defaults.tracking ?? 0} onInput=${onTrack}
    />
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

export function DesignPanel({ theme, update, onUploadFont, site, onUpdateSite, onUploadLogo, onRemoveLogo }) {
  const customFonts = theme.customFonts || [];
  const setFont = (key) => (name) => {
    const curated = fontByName(name);
    update({ style: key, patch: { font: name, fontQuery: curated ? curated.query : "" } });
  };
  const setSize = (key) => (size) => update({ style: key, patch: { size } });
  const setTrack = (key) => (tracking) => update({ style: key, patch: { tracking } });
  const resetStyle = (key) => () => update({ style: key, patch: { ...DEFAULT_THEME.styles[key] } });
  const setColor = (k) => (val) => update({ color: k, value: val });

  return html`<div class="design-panel">
    <div class="design-controls">
      <h2>Design</h2>
      <p class="design-intro">Set the font, size & letter-spacing for each text style. Changes preview live and apply site-wide when you Save. The tick on each slider marks the default.</p>

      <h3>Site identity</h3>
      <label class="design-row">
        <span class="design-label">Name</span>
        <input
          class="design-select" type="text" value=${site.name}
          onInput=${(e) => onUpdateSite({ name: e.target.value })}
        />
      </label>
      <div class="design-row">
        <span class="design-label">Logo</span>
        <span class="design-logo">
          ${site.logo ? html`<img class="design-logo-thumb" src=${assetUrl(site.logo)} alt="" />` : null}
          <button class="design-upload" type="button" onClick=${onUploadLogo}>⬆ Upload a logo…</button>
          ${site.logo
            ? html`<button class="design-reset" type="button" onClick=${onRemoveLogo}>Remove logo</button>`
            : null}
        </span>
      </div>
      <p class="design-hint">Shown top-left on every page. Upload a logo image, or leave it blank to show your name instead.</p>

      <h3>Text styles</h3>
      ${STYLES.map(
        (def) => html`<${StyleRow}
          def=${def}
          style=${theme.styles[def.key]}
          defaults=${DEFAULT_THEME.styles[def.key]}
          customFonts=${customFonts}
          onFont=${setFont(def.key)}
          onSize=${setSize(def.key)}
          onTrack=${setTrack(def.key)}
          onReset=${resetStyle(def.key)}
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

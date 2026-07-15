// Canonical row renderer — mirrors the renderRow macro in
// src/_includes/layouts/project.njk. This is BOTH what you see and what you
// edit, so it must stay in lockstep with the njk macro (the build-diff test
// guards published output).
import { html } from "@/lib.js";
import { assetUrl } from "@/surface/assets.js";
import { EditableText } from "@/surface/EditableText.js";
import { RowTools } from "@/surface/inline/Controls.js";

function bgStyle(row) {
  let s = `background-image: url('${assetUrl(row.src)}');`;
  if (row.crop) {
    s += `background-position:${row.crop.x}% ${row.crop.y}%;background-size:${row.crop.size}%;`;
  }
  return s;
}
function halfClasses(row) {
  if (row.crop) return " bg-cropped";
  return (row.fit ? " " + row.fit : "") + (row.zoom ? " " + row.zoom : "");
}
function fullClasses(row) {
  if (row.crop) return " bg-cropped";
  return row.fit ? " " + row.fit : "";
}

const HALF = new Set(["image_half", "video_half", "text_half"]);
function spanClass(type) {
  return HALF.has(type) ? "col-span-6 md:col-span-3" : "col-span-6 md:col-span-6";
}

export function Row({ row, editable, onChange, onImageClick, tools }) {
  const inner = renderInner({ row, editable, onChange, onImageClick });
  // Read-only / preview: render exactly as the published markup (verified
  // pixel-match). Edit mode: wrap in a positioned grid cell so the row toolbar
  // can overlay without disturbing layout. Wrapper is admin-only.
  if (!(editable && tools)) return inner;
  return html`<div class=${"surf-row " + spanClass(row.type)}>
    ${inner}
    <${RowTools} row=${row} tools=${tools} />
  </div>`;
}

function renderInner({ row, editable, onChange, onImageClick }) {
  const set = (patch) => onChange && onChange({ ...row, ...patch });
  const imgClick =
    editable && onImageClick
      ? (e) => onImageClick(row, e.currentTarget || e.target)
      : undefined;
  const imgAttr = editable && onImageClick ? "1" : undefined;

  switch (row.type) {
    case "text_half":
      return html`<div class="project-caption col-span-6 md:col-span-3">
        <${EditableText}
          tag="p"
          value=${row.text}
          editable=${editable}
          placeholder="Caption text…"
          onCommit=${(t) => set({ text: t })}
        />
      </div>`;

    case "video_half":
      return html`<video
        class="project-image roundy col-span-6 md:col-span-3"
        src=${assetUrl(row.src)}
        style="object-fit: cover;"
        autoplay
        loop
        muted
        playsinline
        data-editable-img=${imgAttr}
        onClick=${imgClick}
      />`;

    case "image_half":
      return html`<div
        class=${"project-image roundy col-span-6 md:col-span-3" +
        halfClasses(row)}
        style=${bgStyle(row)}
        data-editable-img=${imgAttr}
        onClick=${imgClick}
      />`;

    case "video_full":
      return html`<div
        class=${"wide-project-image roundy col-span-6 md:col-span-6" +
        (row.natural_height ? " wide-project-image--natural" : "")}
        data-editable-img=${imgAttr}
        onClick=${imgClick}
      >
        <video src=${assetUrl(row.src)} autoplay loop muted playsinline></video>
      </div>`;

    case "image_full_natural":
      return html`<div class="roundy col-span-6 md:col-span-6">
        <img
          src=${assetUrl(row.src)}
          alt=${row.alt || ""}
          style="width: 100%; height: auto; object-fit: cover;"
          data-editable-img=${imgAttr}
          onClick=${imgClick}
        />
      </div>`;

    default: // image_full
      return html`<div
        class=${"wide-project-image roundy col-span-6 md:col-span-6" +
        fullClasses(row)}
        style=${bgStyle(row)}
        data-editable-img=${imgAttr}
        onClick=${imgClick}
      />`;
  }
}

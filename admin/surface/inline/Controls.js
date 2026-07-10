// Small editor-only control widgets used to add/delete/reorder/retype content
// directly on the surface. These render only in edit mode and never ship to the
// published site (the surface renderer is admin-only).
import { html, useState } from "@/lib.js";

export const ROW_TYPES = [
  { type: "image_full", label: "Full-width image" },
  { type: "image_full_natural", label: "Full image (natural height)" },
  { type: "image_half", label: "Half-width image" },
  { type: "video_full", label: "Full-width video" },
  { type: "video_half", label: "Half-width video" },
  { type: "text_half", label: "Caption text" },
];

export function blankRow(type) {
  switch (type) {
    case "text_half":
      return { type, text: "" };
    case "image_full_natural":
      return { type, src: "", alt: "" };
    case "video_full":
      return { type, src: "", natural_height: false };
    case "video_half":
      return { type, src: "" };
    case "image_half":
    case "image_full":
    default:
      return { type, src: "" };
  }
}

const stop = (e) => {
  e.stopPropagation();
};

// Floating per-row toolbar (overlaid inside the row element).
export function RowTools({ row, tools }) {
  return html`<div class="row-tools" onClick=${stop} onPointerDown=${stop}>
    <button class="rt-btn" title="Move earlier" disabled=${!tools.canUp} onClick=${tools.onMoveUp}>↑</button>
    <button class="rt-btn" title="Move later" disabled=${!tools.canDown} onClick=${tools.onMoveDown}>↓</button>
    <select
      class="rt-select"
      title="Change block type"
      value=${row.type}
      onChange=${(e) => tools.onChangeType(e.target.value)}
    >
      ${ROW_TYPES.map((t) => html`<option value=${t.type}>${t.label}</option>`)}
    </select>
    ${row.type === "video_full"
      ? html`<button
          class=${"rt-btn" + (row.natural_height ? " is-on" : "")}
          title="Scale the video to its own height instead of cropping it"
          onClick=${() => tools.onSetNatural(!row.natural_height)}
        >
          Natural height
        </button>`
      : null}
    <button class="rt-btn rt-del" title="Delete block" onClick=${tools.onDelete}>✕</button>
  </div>`;
}

// "+ Add block" button that opens a type menu.
export function AddRowMenu({ onAdd, label = "+ Add block" }) {
  const [open, setOpen] = useState(false);
  return html`<div class="add-row">
    <button class="add-row-btn" onClick=${() => setOpen((o) => !o)}>${label}</button>
    ${open
      ? html`<div class="add-row-menu">
          ${ROW_TYPES.map(
            (t) => html`<button
              class="add-row-item"
              onClick=${() => {
                onAdd(t.type);
                setOpen(false);
              }}
            >
              ${t.label}
            </button>`
          )}
        </div>`
      : null}
  </div>`;
}

export function DelBtn({ onClick, title = "Delete" }) {
  return html`<button class="mini-del" title=${title} onClick=${onClick}>✕</button>`;
}

export function AddBtn({ onClick, label }) {
  return html`<button class="mini-add" onClick=${onClick}>${label}</button>`;
}

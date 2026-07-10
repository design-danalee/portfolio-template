// In-place crop/zoom modal. The frame renders the EXACT published CSS
// (background-size %, background-position %) at the real container's aspect
// ratio, so what you set here is exactly what publishes.
import { html, useState, useRef } from "@/lib.js";
import { assetUrl } from "@/surface/assets.js";
import { defaultCrop, clamp, panByPixels, roundCrop } from "@/crop/cropMath.js";

export function CropControl({ row, aspect, onApply, onCancel, onClear, onReplace }) {
  const [crop, setCrop] = useState(() => defaultCrop(row));
  const drag = useRef(null);

  const frameW = Math.min(560, Math.round(window.innerWidth * 0.78));
  const frameH = Math.max(160, Math.round(frameW / (aspect || 1)));

  function onPointerDown(e) {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY };
  }
  function onPointerMove(e) {
    if (!drag.current) return;
    const dx = e.clientX - drag.current.x;
    const dy = e.clientY - drag.current.y;
    drag.current = { x: e.clientX, y: e.clientY };
    setCrop((c) => panByPixels(c, dx, dy, frameW, frameH));
  }
  function onPointerUp() {
    drag.current = null;
  }
  function onWheel(e) {
    e.preventDefault();
    setCrop((c) => ({ ...c, size: clamp(c.size + (e.deltaY < 0 ? 4 : -4), 30, 400) }));
  }

  const frameStyle =
    `width:${frameW}px;height:${frameH}px;` +
    `background-image:url('${assetUrl(row.src)}');` +
    `background-position:${crop.x}% ${crop.y}%;` +
    `background-size:${crop.size}%;` +
    `background-repeat:no-repeat;`;

  return html`<div
    class="crop-overlay"
    onClick=${(e) => {
      if (e.target === e.currentTarget) onCancel();
    }}
  >
    <div class="crop-modal">
      <div class="crop-modal-head">
        <strong>Crop &amp; zoom</strong>
        <span class="crop-hint">Drag to reposition · scroll or slider to zoom</span>
      </div>
      <div
        class="crop-frame roundy"
        style=${frameStyle}
        onPointerDown=${onPointerDown}
        onPointerMove=${onPointerMove}
        onPointerUp=${onPointerUp}
        onWheel=${onWheel}
      ></div>
      <div class="crop-controls">
        <label class="crop-zoom">
          <span>Zoom</span>
          <input
            type="range"
            min="30"
            max="400"
            value=${crop.size}
            onInput=${(e) => setCrop((c) => ({ ...c, size: Number(e.target.value) }))}
          />
          <span class="crop-zoom-val">${Math.round(crop.size)}%</span>
        </label>
      </div>
      <div class="crop-actions">
        ${onReplace
          ? html`<button class="admin-btn crop-replace" onClick=${onReplace}>
              Replace image…
            </button>`
          : null}
        <button class="admin-btn" onClick=${onCancel}>Cancel</button>
        <button class="admin-btn" onClick=${onClear}>Remove crop</button>
        <button
          class="admin-btn admin-btn--primary"
          onClick=${() => onApply(roundCrop(crop))}
        >
          Apply
        </button>
      </div>
    </div>
  </div>`;
}

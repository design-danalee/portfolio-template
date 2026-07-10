// Pure crop math. Non-destructive: produces {x,y,size} where x/y are
// background-position percentages (0-100) and size is background-size percent.
// The crop frame renders the exact published CSS, so the preview IS the result
// — the pan sensitivity constant only affects feel, not fidelity.
export function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

// Seed an initial crop from any legacy fit/zoom, else centered at 100%.
export function defaultCrop(row) {
  if (row.crop) return { ...row.crop };
  let size = 100;
  if (row.zoom === "bg-size-zoom-in") size = 130;
  else if (row.zoom === "bg-size-zoom-out") size = 70;
  let x = 50;
  let y = 50;
  if (row.fit === "bg-left") x = 0;
  else if (row.fit === "bg-right") x = 100;
  if (row.fit === "bg-top") y = 0;
  else if (row.fit === "bg-bottom") y = 100;
  return { x, y, size };
}

// Translate a pixel drag on the frame into a background-position delta.
// Dragging the image right reveals its left side -> position decreases.
export function panByPixels(crop, dxPx, dyPx, frameW, frameH) {
  const denom = Math.max(crop.size / 100 - 1, 0.15); // avoid divide-by-zero at <=100%
  return {
    ...crop,
    x: clamp(crop.x - (dxPx / frameW) * 100 / denom, 0, 100),
    y: clamp(crop.y - (dyPx / frameH) * 100 / denom, 0, 100),
  };
}

export function roundCrop(crop) {
  return {
    x: Math.round(crop.x),
    y: Math.round(crop.y),
    size: Math.round(crop.size),
  };
}

// Media upload helpers. Files are read to base64 and committed via the Git Data
// API (no 1MB limit). Videos get size guardrails because they permanently bloat
// git history (checked out on every CI build).
import { CONFIG } from "@/config.js";

function mb(bytes) {
  return (bytes / (1024 * 1024)).toFixed(1);
}

// Open a native file picker and resolve with the chosen File (or null).
export function openFilePicker(accept) {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    if (accept) input.accept = accept;
    input.style.display = "none";
    document.body.appendChild(input);
    input.addEventListener(
      "change",
      () => {
        const f = input.files && input.files[0];
        document.body.removeChild(input);
        resolve(f || null);
      },
      { once: true }
    );
    input.click();
  });
}

export function readFile(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      const dataUrl = String(r.result);
      resolve({ dataUrl, base64: dataUrl.split(",")[1] });
    };
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
}

// Target repo path for an uploaded file (assets/<clean-name>).
export function assetPathFor(file) {
  const clean = file.name
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/-*\.-*/g, ".") // tidy dashes around the extension dot
    .replace(/^-+|-+$/g, "");
  return CONFIG.mediaDir + "/" + (clean || "upload");
}

const VIDEO_RE = /^video\//;
const VIDEO_EXT = /\.(mp4|mov|webm|m4v)$/i;

// Returns { block?, warn?, message? }.
export function checkMedia(file) {
  const isVideo = VIDEO_RE.test(file.type) || VIDEO_EXT.test(file.name);
  if (!isVideo) return {};
  if (file.size > CONFIG.videoBlockBytes) {
    return {
      block: true,
      message: `That video is ${mb(file.size)} MB — over the ${mb(
        CONFIG.videoBlockBytes
      )} MB limit. Compress it or host it externally (Vimeo, etc.) and link it.`,
    };
  }
  if (file.size > CONFIG.videoWarnBytes) {
    return {
      warn: true,
      message: `This video is ${mb(
        file.size
      )} MB. Large videos bloat the repo and slow every build. Commit it anyway?`,
    };
  }
  return {};
}

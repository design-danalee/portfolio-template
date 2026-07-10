// Shared Preact + htm bindings. Every admin module imports from here so the
// vendored (import-mapped) preact/htm are bound in exactly one place.
import { h } from "preact";
import htm from "htm";

export { h, render, Fragment, createRef, Component } from "preact";
export {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  useReducer,
} from "preact/hooks";

export const html = htm.bind(h);

export function escapeHtml(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

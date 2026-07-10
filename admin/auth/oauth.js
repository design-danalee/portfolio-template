// GitHub auth. Reuses the existing PHP OAuth proxy (/oauth/auth.php + callback.php)
// by replicating Decap's postMessage handshake. Token is held in memory, with a
// sessionStorage fallback (per-tab, cleared on close) — never localStorage.
import { CONFIG } from "@/config.js";

let memToken = null;
const KEY = "hd_gh_token";

export function getToken() {
  if (memToken) return memToken;
  try {
    return sessionStorage.getItem(KEY);
  } catch (_) {
    return null;
  }
}
export function setToken(t, persist) {
  memToken = t;
  if (persist) {
    try {
      sessionStorage.setItem(KEY, t);
    } catch (_) {}
  }
}
export function clearToken() {
  memToken = null;
  try {
    sessionStorage.removeItem(KEY);
  } catch (_) {}
}

// Opens the OAuth popup and resolves with a token. MUST be called from within a
// user gesture (click) or the popup is blocked.
export function loginWithGitHub() {
  return new Promise((resolve, reject) => {
    const popup = window.open(
      CONFIG.authEndpoint,
      "hd-github-oauth",
      "width=700,height=820"
    );
    if (!popup) {
      reject(new Error("Popup blocked — allow popups for this site."));
      return;
    }
    let done = false;
    function cleanup() {
      done = true;
      window.removeEventListener("message", onMessage);
      clearInterval(poll);
      try {
        popup.close();
      } catch (_) {}
    }
    function onMessage(e) {
      if (e.origin !== location.origin || e.source !== popup) return;
      const data = e.data;
      if (typeof data !== "string") return;
      if (data === "authorizing:github") {
        // Reply so callback.php captures our origin, then sends the token.
        popup.postMessage("authorizing:github", location.origin);
        return;
      }
      const OK = "authorization:github:success:";
      const ERR = "authorization:github:error:";
      if (data.indexOf(OK) === 0) {
        const payload = JSON.parse(data.slice(OK.length));
        cleanup();
        setToken(payload.token, true);
        resolve(payload.token);
      } else if (data.indexOf(ERR) === 0) {
        const payload = JSON.parse(data.slice(ERR.length));
        cleanup();
        reject(new Error(payload.message || "OAuth error"));
      }
    }
    const poll = setInterval(() => {
      if (!done && popup.closed) {
        cleanup();
        reject(new Error("Sign-in window closed before finishing."));
      }
    }, 500);
    window.addEventListener("message", onMessage);
  });
}

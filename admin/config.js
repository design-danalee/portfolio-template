// Repo + site configuration for the custom CMS.
//
// You normally DON'T edit this file. On deploy, CI writes `admin/repo.json`
// (owner/repo/branch) from the GitHub repository the site is deployed from, and
// the CMS loads it at startup via loadRepoConfig(). For local development,
// create your own `admin/repo.json` (git-ignored) — see admin/repo.sample.json.
export const CONFIG = {
  // Filled in from admin/repo.json at startup (these are inert placeholders).
  owner: "__OWNER__",
  repo: "__REPO__",
  branch: "main",
  // Assets are published at the same origin the CMS runs on — no hardcoded domain.
  get siteOrigin() {
    return location.origin;
  },
  // Where uploaded media is committed in the repo.
  mediaDir: "assets",
  // PHP OAuth proxy endpoint, served from the same origin in production.
  authEndpoint: "/oauth/auth.php",
  // Video upload guardrails (bytes).
  videoWarnBytes: 10 * 1024 * 1024,
  videoBlockBytes: 25 * 1024 * 1024,
};

// Load owner/repo/branch from admin/repo.json (written by CI on deploy, or
// created locally for dev). Safe no-op if the file is missing.
export async function loadRepoConfig() {
  try {
    const res = await fetch("/admin/repo.json?_=" + Date.now(), {
      cache: "no-store",
    });
    if (!res.ok) return;
    const j = await res.json();
    if (j.owner) CONFIG.owner = j.owner;
    if (j.repo) CONFIG.repo = j.repo;
    if (j.branch) CONFIG.branch = j.branch;
  } catch (_) {
    /* missing repo.json → placeholders remain; the UI surfaces a clear error */
  }
}

export function isConfigured() {
  return CONFIG.owner !== "__OWNER__" && CONFIG.repo !== "__REPO__";
}

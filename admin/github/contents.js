// Read-only content access.
//   read()  -> raw.githubusercontent.com (GitHub's CDN). NOT subject to the
//              60/hr Contents-API rate limit, so browsing barely touches the API.
//   list()  -> Contents API (the one metered call per load; callers fall back to
//              a home-page parse if this is rate-limited — see content/projects.js).
// Login is only needed to commit.
import { CONFIG } from "@/config.js";

const RAW = "https://raw.githubusercontent.com";

export function makeContents(client) {
  const base = `/repos/${CONFIG.owner}/${CONFIG.repo}/contents`;
  const ref = `?ref=${CONFIG.branch}`;
  return {
    // List a directory -> array of {name, path, type, ...} (Contents API).
    async list(dir) {
      return client.api(`${base}/${dir}${ref}`);
    },
    // Read a text file from the CDN -> {text, sha}. sha is unused by the write
    // path (Git Data API resolves its own refs), so it's null here.
    async read(path) {
      const url = `${RAW}/${CONFIG.owner}/${CONFIG.repo}/${CONFIG.branch}/${encodeURI(
        path
      )}?_=${Date.now()}`; // cache-buster: raw CDN caches ~5 min otherwise
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) {
        const err = new Error(`raw ${res.status} for ${path}`);
        err.status = res.status;
        throw err;
      }
      return { text: await res.text(), sha: null };
    },
  };
}

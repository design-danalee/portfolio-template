// Thin GitHub REST wrapper. Adds auth + JSON handling and surfaces status codes
// so callers (e.g. the Git Data commit flow) can react to 422 non-fast-forward.
export function makeClient(getToken) {
  async function api(path, opts = {}) {
    const headers = Object.assign(
      { Accept: "application/vnd.github+json" },
      opts.headers || {}
    );
    const token = getToken && getToken();
    if (token) headers["Authorization"] = "token " + token;
    if (opts.body && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }
    const res = await fetch("https://api.github.com" + path, {
      ...opts,
      headers,
    });
    if (!res.ok) {
      let body = "";
      try {
        body = await res.text();
      } catch (_) {}
      const err = new Error(`GitHub ${res.status}: ${body.slice(0, 300)}`);
      err.status = res.status;
      err.body = body;
      throw err;
    }
    if (res.status === 204) return null;
    return res.json();
  }
  return { api };
}

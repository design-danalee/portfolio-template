// Commit via the Git Data API (blob -> tree -> commit -> update ref).
// This bypasses the Contents API's ~1MB limit and lets one Save commit
// several files atomically (e.g. edited markdown + a new uploaded image).
import { CONFIG } from "@/config.js";

// Encode a UTF-8 string to base64 (handles non-Latin1 safely).
export function utf8ToBase64(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

export function makeGitData(client) {
  const R = `/repos/${CONFIG.owner}/${CONFIG.repo}`;
  const branch = CONFIG.branch;

  async function getHead() {
    const ref = await client.api(`${R}/git/ref/heads/${branch}`);
    const headSha = ref.object.sha;
    const commit = await client.api(`${R}/git/commits/${headSha}`);
    return { headSha, baseTree: commit.tree.sha };
  }

  // files: [{ path, content, encoding? }]
  //   encoding 'utf-8' (default) | 'base64'
  // deletions: ["path/to/remove", ...]
  async function commit({ files = [], deletions = [], message }) {
    let lastErr;
    for (let attempt = 0; attempt < 3; attempt++) {
      const { headSha, baseTree } = await getHead();

      const tree = [];
      for (const f of files) {
        const encoding = f.encoding || "utf-8";
        const blob = await client.api(`${R}/git/blobs`, {
          method: "POST",
          body: JSON.stringify(
            encoding === "base64"
              ? { content: f.content, encoding: "base64" }
              : { content: f.content, encoding: "utf-8" }
          ),
        });
        tree.push({ path: f.path, mode: "100644", type: "blob", sha: blob.sha });
      }
      for (const path of deletions) {
        tree.push({ path, mode: "100644", type: "blob", sha: null });
      }

      const newTree = await client.api(`${R}/git/trees`, {
        method: "POST",
        body: JSON.stringify({ base_tree: baseTree, tree }),
      });
      const newCommit = await client.api(`${R}/git/commits`, {
        method: "POST",
        body: JSON.stringify({
          message,
          tree: newTree.sha,
          parents: [headSha],
        }),
      });
      try {
        await client.api(`${R}/git/refs/heads/${branch}`, {
          method: "PATCH",
          body: JSON.stringify({ sha: newCommit.sha, force: false }),
        });
        return newCommit.sha;
      } catch (e) {
        lastErr = e;
        // 422 = non-fast-forward (ref moved under us). Rebuild on the new head.
        if (e.status === 422 && attempt < 2) continue;
        throw e;
      }
    }
    throw lastErr;
  }

  return { commit, getHead };
}

// Repo + site configuration for the custom CMS.
// Mirrors the old Decap backend block (design-danalee/hellodanalee-website @ main).
export const CONFIG = {
  owner: "design-danalee",
  repo: "hellodanalee-website",
  branch: "main",
  // Assets are published at the live site root, so display them from there.
  siteOrigin: "https://hellodanalee.com",
  // Where uploaded media is committed in the repo.
  mediaDir: "assets",
  // OAuth proxy endpoint (PHP), served from the same origin in production.
  authEndpoint: "/oauth/auth.php",
  // Video upload guardrails (bytes).
  videoWarnBytes: 10 * 1024 * 1024,
  videoBlockBytes: 25 * 1024 * 1024,
};

# Content management & build — setup guide

Your site is a small **Eleventy** static site with a **custom inline CMS** at `/admin/`.
You edit content directly on a live render of each page — never HTML — and every save
commits to `main`, which rebuilds and deploys automatically.

---

## How it's organized

```
src/
  _data/            Editable copy for the singleton pages
    home.json         Home hero text
    about.json        About hero, body sections, "Partner with Me", data points
    contact.json      Contact hero + dropdown options
  _includes/
    layouts/          base.njk (page shell), project.njk (case-study template)
    partials/         header.njk, footer.njk
  projects/         One file per case study (shipium.md, hbcuv.md, …)
  index.njk         Home page (work grid is built from src/projects automatically)
  about.njk
  contact.njk
assets/             Images & videos (CMS uploads land here)
admin/              The custom CMS — a no-build Preact app served at /admin/
oauth/              PHP GitHub login proxy (auth.php, callback.php)
main.css, *.css, *.js, contact.php   Static files, copied as-is to the build
```

The published files (`index.html`, `shipium.html`, …) are **generated** into `_site/`
during the build. Don't hand-edit them.

### Inside `admin/`

```
index.html            Entry (import map + CSP); loads the real site CSS so the
                      editing surface looks exactly like the published page
app.js                Orchestrator: routing, content store, save/commit
vendor/               Pinned preact / htm / js-yaml (committed, no CDN at runtime)
github/               GitHub read (Contents API) + write (Git Data API)
content/              Frontmatter + JSON (de)serialization
surface/              The editable render (mirrors project.njk + the page templates)
crop/                 In-place crop/zoom control
media/                Uploads (base64 blobs, video size guardrails)
```

---

## Working locally

```bash
npm install          # one time
npm start            # live preview at http://localhost:8080
npm run build        # one-off build into _site/
```

Open **http://localhost:8080/admin/**. Browsing/read is **unauthenticated** (the repo
is public). To *save* locally, sign in with a token (see below) — GitHub OAuth only
works on the live domain where the PHP proxy runs.

---

## Signing in

The CMS commits to GitHub on your behalf, so saving needs a GitHub login. Two ways
(the **Sign in** button offers both):

1. **Sign in with GitHub** — a popup through the PHP OAuth proxy in `/oauth/`. Works on
   the live site once the OAuth app is configured (below). This is the normal path.
2. **Use a token** — paste a fine-grained personal access token. Handy for local dev.
   Create one at GitHub → Settings → Developer settings → **Fine-grained tokens**, scoped
   to **this repo only**, with **Repository permissions → Contents: Read and write**.

The token is held in memory / sessionStorage only (per-tab, cleared when you close it) —
never committed, never in localStorage.

### One-time GitHub OAuth app (for the live "Sign in with GitHub")

GitHub → **Settings → Developer settings → OAuth Apps → New OAuth App**

- **Homepage URL:** `https://hellodanalee.com`
- **Authorization callback URL:** `https://hellodanalee.com/oauth/callback.php`

Register, generate a client secret, and add both as repo **Actions secrets**:
`GH_OAUTH_CLIENT_ID` and `GH_OAUTH_CLIENT_SECRET`. On each deploy the workflow writes
them into `/oauth/oauth-config.php` on the server (never committed). Or copy
`oauth/oauth-config.sample.php` → `oauth-config.php` on the server by hand.

---

## Using the CMS

Open `/admin/`, pick a page or case study, and toggle **Editing**:

- **Text** — click any headline, paragraph, tagline, caption, capability, or list item to
  edit it in place.
- **Images** — click a photo to **crop/zoom** it (drag to reposition, scroll/slider to
  zoom) or **Replace** it. Cropping is non-destructive — the original file is kept.
- **Video / natural-height images** — click to replace via upload.
- **Structure** — hover a block for its toolbar (move ↑/↓, change type, delete); use
  **+ Add block** / **+ Add section**; edit Home cards, About tiles/facts, and Contact
  dropdown options inline. Create a new case study with **+ New case study**.

Press **Save** to commit. Uploads (images/videos) ride along in the same commit via the
Git Data API — **no 1 MB limit** (large videos are warned/blocked to keep the repo lean).
Every save is one commit to `main`, which triggers the rebuild + FTP deploy (a few minutes).

---

## Deploy notes

- `.github/workflows/deploy.yml` runs `npm ci` → `npm run build` → writes the OAuth
  config → FTP-uploads **`_site/`** (which includes `admin/`).
- `dangerous-clean-slate` is **off**, so server-only files not in the build —
  `smtp-config.php`, `phpmailer/`, and `oauth/oauth-config.php` — are preserved.

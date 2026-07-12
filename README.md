# Portfolio Template

A ready-to-use portfolio website with a built-in content editor — no coding required
to run your own copy, and no coding required to update it afterward.

- **Your own copy, your own domain, your own GitHub account.** Click "Use this
  template" and you get an independent website — not linked back to anyone else's.
- **Edit everything from the browser.** Text, images, case studies, fonts, colors,
  text sizes, and your contact form — all editable at `yourdomain.com/admin/`. No
  code editor, no terminal.
- **Your contact form emails go to you.** Set your own notification address (and,
  if you want, reshape the form itself — add fields, rename labels, change field
  types) right from the CMS.

## Start here

**[GUIDE.md](GUIDE.md)** is the full, step-by-step setup walkthrough — written for
someone who has never touched code or a terminal before. Start there.

## If you're sharing this repo with others

So people can click **"Use this template"** and get their own independent copy
(instead of a linked fork), turn this repo into a GitHub template once:
**Settings → General → check "Template repository."** Do this after pushing —
it's a one-time setting on this repo, not something each new copy needs to touch.

## What this is, technically

(Skip this if you're following GUIDE.md — it's here for anyone curious, or for a
developer helping you set things up.)

- A static site built with **[Eleventy](https://www.11ty.dev/)** — plain HTML/CSS/JS,
  no server-side app required to *run* it.
- Content lives as Markdown/JSON files in this repo (`src/_data/`, `src/projects/`).
- A custom, no-build content editor at `/admin/` reads and writes those files
  directly via the GitHub API — every save is a commit, which triggers an
  automatic rebuild-and-deploy.
- Deployment is **GitHub Actions → FTP**, so it runs on any standard PHP web
  host (Bluehost, HostGator, etc.) — no special server software needed beyond
  PHP (for the contact form and the CMS sign-in).

### Working on it locally

```bash
npm install
npm start          # dev server at http://localhost:8080
npm run build      # one-off build into _site/
```

You can browse `/admin/` locally without signing in (read-only). Saving
requires GitHub sign-in, which only works once this repo is deployed to a
real domain (see GUIDE.md) — or you can paste a personal access token for
local testing.

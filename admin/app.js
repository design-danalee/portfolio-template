// Custom CMS — orchestrator: auth gate, routing, content store, save (commit).
import {
  html,
  render,
  useState,
  useEffect,
  useCallback,
} from "@/lib.js";
import { loadRepoConfig } from "@/config.js";
import { makeClient } from "@/github/client.js";
import { makeContents } from "@/github/contents.js";
import { makeGitData } from "@/github/gitdata.js";
import {
  makeProjects,
  serializeProject,
  projectPath,
  slugify,
  blankProject,
} from "@/content/projects.js";
import { makePages, serializePage, PAGE_FILES } from "@/content/pages.js";
import { ProjectSurface } from "@/surface/ProjectSurface.js";
import { PageSurface } from "@/surface/PageSurface.js";
import { CropControl } from "@/crop/CropControl.js";
import { setAssetOverride } from "@/surface/assets.js";
import {
  openFilePicker,
  readFile,
  assetPathFor,
  checkMedia,
} from "@/media/upload.js";
import {
  getToken,
  setToken,
  clearToken,
  loginWithGitHub,
} from "@/auth/oauth.js";
import { DesignPanel } from "@/design/DesignPanel.js";
import { applyTheme, serializeTheme, THEME_FILE, DEFAULT_THEME } from "@/design/theme.js";

const client = makeClient(getToken);
const contents = makeContents(client);
const gitdata = makeGitData(client);
const projectsApi = makeProjects(contents);
const pagesApi = makePages(contents);

const PAGE_NAMES = ["home", "about", "contact"];

function useHashRoute() {
  const [hash, setHash] = useState(location.hash || "#/");
  useEffect(() => {
    const on = () => setHash(location.hash || "#/");
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  return hash;
}
function navigate(hash) {
  location.hash = hash;
}

function App() {
  const hash = useHashRoute();
  const [store, setStore] = useState(null); // {projects:[], pages:{}}
  const [loadErr, setLoadErr] = useState(null);
  const [dirty, setDirty] = useState(() => new Set());
  const [editable, setEditable] = useState(false);
  const [authed, setAuthed] = useState(!!getToken());
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const [cropState, setCropState] = useState(null); // {slug, loc, row, aspect}
  const [pendingMedia, setPendingMedia] = useState({}); // path -> {base64}
  const [showLogin, setShowLogin] = useState(false);

  // Initial load (read-only; works unauthenticated on the public repo).
  useEffect(() => {
    (async () => {
      try {
        await loadRepoConfig(); // resolve owner/repo/branch before any API call
        const [projects, home, about, contact, themeData] = await Promise.all([
          projectsApi.list(),
          pagesApi.load("home"),
          pagesApi.load("about"),
          pagesApi.load("contact"),
          contents
            .read(THEME_FILE)
            .then((r) => JSON.parse(r.text))
            .catch(() => DEFAULT_THEME), // theme.json missing → sensible defaults
        ]);
        const theme = { path: THEME_FILE, data: themeData };
        applyTheme(theme.data);
        setStore({ projects, pages: { home, about, contact }, theme });
      } catch (e) {
        setLoadErr(e.message || String(e));
      }
    })();
  }, []);

  const markDirty = (path) =>
    setDirty((prev) => {
      const next = new Set(prev);
      next.add(path);
      return next;
    });

  const updateProjectData = useCallback((slug, patch) => {
    setStore((s) => {
      const projects = s.projects.map((p) =>
        p.slug === slug ? { ...p, data: { ...p.data, ...patch } } : p
      );
      return { ...s, projects };
    });
    markDirty(projectPath(slug));
  }, []);

  const updatePageData = useCallback((name, patch) => {
    setStore((s) => {
      const page = s.pages[name];
      return {
        ...s,
        pages: { ...s.pages, [name]: { ...page, data: { ...page.data, ...patch } } },
      };
    });
    markDirty(PAGE_FILES[name]);
  }, []);

  const updateTheme = useCallback((patch) => {
    setStore((s) => {
      const data = { ...s.theme.data, ...patch };
      applyTheme(data); // live preview across the surface
      return { ...s, theme: { ...s.theme, data } };
    });
    markDirty(THEME_FILE);
  }, []);

  async function ensureAuth() {
    if (getToken()) {
      setAuthed(true);
      return true;
    }
    setShowLogin(true);
    return false;
  }

  async function loginOAuth() {
    try {
      await loginWithGitHub();
      setAuthed(true);
      setShowLogin(false);
    } catch (e) {
      setMsg({ kind: "error", text: e.message });
    }
  }
  function loginToken(token) {
    const t = (token || "").trim();
    if (!t) return;
    setToken(t, true);
    setAuthed(true);
    setShowLogin(false);
    setMsg({ kind: "info", text: "Signed in with token." });
  }

  async function save() {
    if (!(await ensureAuth())) return;
    if (dirty.size === 0) {
      setMsg({ kind: "info", text: "Nothing to save." });
      return;
    }
    setSaving(true);
    setMsg(null);
    try {
      const files = [];
      const labels = [];
      // Uploaded media blobs (base64) ride along in the same atomic commit.
      for (const [path, m] of Object.entries(pendingMedia)) {
        files.push({ path, content: m.base64, encoding: "base64" });
      }
      for (const path of dirty) {
        if (path.startsWith("src/projects/")) {
          const slug = path.slice("src/projects/".length).replace(/\.md$/, "");
          const project = store.projects.find((p) => p.slug === slug);
          files.push({ path, content: serializeProject(project) });
          labels.push(project.data.title || slug);
        } else if (path === THEME_FILE) {
          files.push({ path, content: serializeTheme(store.theme.data) });
          labels.push("design");
        } else {
          const name = Object.keys(PAGE_FILES).find((n) => PAGE_FILES[n] === path);
          files.push({ path, content: serializePage(store.pages[name]) });
          labels.push(name);
        }
      }
      const message =
        "admin: update " + labels.join(", ").slice(0, 72);
      const sha = await gitdata.commit({ files, message });
      setDirty(new Set());
      setPendingMedia({}); // committed; overrides stay for preview until reload
      setMsg({
        kind: "success",
        text: `Saved (${files.length} file${files.length > 1 ? "s" : ""}). Deploy runs automatically — live in a few minutes.`,
      });
    } catch (e) {
      setMsg({ kind: "error", text: "Save failed: " + (e.message || e) });
    } finally {
      setSaving(false);
    }
  }

  function createProject() {
    const title = prompt("New case study title:");
    if (!title) return;
    let slug = slugify(title);
    if (!slug) return;
    if (store.projects.some((p) => p.slug === slug)) {
      setMsg({ kind: "error", text: `A project "${slug}" already exists.` });
      return;
    }
    const proj = blankProject(slug, title);
    setStore((s) => ({ ...s, projects: [...s.projects, proj] }));
    markDirty(proj.path);
    setEditable(true);
    navigate("#/project/" + slug);
  }

  function currentProjectSlug() {
    const m = /^#\/project\/(.+)$/.exec(hash);
    return m ? decodeURIComponent(m[1]) : null;
  }

  // Update one row in place: mutate(row) -> newRow.
  function updateRow(slug, loc, mutate) {
    setStore((s) => {
      const projects = s.projects.map((p) => {
        if (p.slug !== slug) return p;
        const sections = p.data.sections.map((sec, si) => {
          if (si !== loc.si) return sec;
          const rows = sec.rows.map((r, ri) => (ri === loc.ri ? mutate(r) : r));
          return { ...sec, rows };
        });
        return { ...p, data: { ...p.data, sections } };
      });
      return { ...s, projects };
    });
    markDirty(projectPath(slug));
  }

  // Upload a file, stage it for the next commit, and hand the repo path to
  // `apply` (which sets it on the right target + marks dirty).
  async function doUpload(accept, apply) {
    const file = await openFilePicker(accept);
    if (!file) return;
    const v = checkMedia(file);
    if (v.block) {
      setMsg({ kind: "error", text: v.message });
      return;
    }
    if (v.warn && !confirm(v.message)) return;
    const { dataUrl, base64 } = await readFile(file);
    const path = assetPathFor(file);
    setAssetOverride(path, dataUrl); // instant preview before commit
    setPendingMedia((m) => ({ ...m, [path]: { base64 } }));
    apply(path);
  }

  // Click an image/video on the surface. Background-image photos (image_half /
  // image_full) open the crop tool (which also offers Replace); videos, natural
  // images, and the hero open a file picker to replace.
  function onImageClick(row, el, loc) {
    const slug = currentProjectSlug();
    if (row.__hero) {
      doUpload("image/*", (p) => updateProjectData(slug, { hero_image: p }));
      return;
    }
    const canCrop = row.type === "image_half" || row.type === "image_full";
    if (canCrop && el) {
      const r = el.getBoundingClientRect();
      const aspect = r.height ? r.width / r.height : 1;
      setCropState({ slug, loc, row, aspect });
      return;
    }
    const accept = String(row.type).startsWith("video") ? "video/*" : "image/*";
    doUpload(accept, (p) => updateRow(slug, loc, (r) => ({ ...r, src: p })));
  }

  // Replace the image of a croppable row (invoked from the crop modal). Clears
  // any existing crop since the new image needs fresh framing.
  function replaceCropImage() {
    if (!cropState) return;
    const { slug, loc } = cropState;
    setCropState(null);
    doUpload("image/*", (p) =>
      updateRow(slug, loc, (r) => {
        const { crop, ...rest } = r;
        return { ...rest, src: p };
      })
    );
  }

  function applyCrop(crop) {
    if (!cropState) return;
    updateRow(cropState.slug, cropState.loc, (r) => ({ ...r, crop }));
    setCropState(null);
  }
  function clearCrop() {
    if (!cropState) return;
    updateRow(cropState.slug, cropState.loc, (r) => {
      const { crop, ...rest } = r;
      return rest;
    });
    setCropState(null);
  }

  // ---------------- render ----------------
  if (loadErr) {
    const rate = /rate limit/i.test(loadErr);
    return html`<div class="admin-center">
      <h1>Couldn't load content</h1>
      <p class="admin-error">
        ${rate
          ? "GitHub's limit for anonymous requests was hit. Sign in to load with your higher authenticated limit (browsing needs no login otherwise)."
          : loadErr}
      </p>
      <div style="display:flex; gap:8px;">
        <button class="admin-btn admin-btn--primary" onClick=${() => setShowLogin(true)}>Sign in</button>
        <button class="admin-btn" onClick=${() => location.reload()}>Retry</button>
      </div>
      ${showLogin
        ? html`<${LoginModal}
            onOAuth=${loginOAuth}
            onToken=${(t) => {
              loginToken(t);
              location.reload();
            }}
            onClose=${() => setShowLogin(false)}
          />`
        : null}
    </div>`;
  }
  if (!store) {
    return html`<div class="admin-center"><p>Loading content…</p></div>`;
  }

  let view;
  const pm = /^#\/project\/(.+)$/.exec(hash);
  const gm = /^#\/page\/(home|about|contact)$/.exec(hash);
  const dm = /^#\/design$/.test(hash);
  if (dm) {
    view = html`<${DesignPanel} theme=${store.theme.data} update=${updateTheme} />`;
  } else if (pm) {
    const slug = decodeURIComponent(pm[1]);
    const project = store.projects.find((p) => p.slug === slug);
    view = project
      ? html`<${ProjectSurface}
          project=${project}
          editable=${editable}
          update=${(patch) => updateProjectData(slug, patch)}
          onImageClick=${onImageClick}
        />`
      : html`<div class="admin-center">Project not found: ${slug}</div>`;
  } else if (gm) {
    const name = gm[1];
    view = html`<${PageSurface}
      page=${store.pages[name]}
      editable=${editable}
      updatePage=${(patch) => updatePageData(name, patch)}
      projects=${store.projects}
      updateProject=${updateProjectData}
      navigate=${navigate}
    />`;
  } else {
    view = html`<${Dashboard} store=${store} onNew=${createProject} />`;
  }

  const title = dm
    ? "Design"
    : pm
    ? store.projects.find((p) => p.slug === decodeURIComponent(pm[1]))?.data
        .title || "Case study"
    : gm
    ? gm[1][0].toUpperCase() + gm[1].slice(1)
    : "Content";

  return html`<div class=${"admin-root" + (editable ? " is-editing" : "")}>
    <${Toolbar}
      title=${title}
      isDashboard=${!pm && !gm && !dm}
      showToggle=${!!(pm || gm)}
      editable=${editable}
      setEditable=${setEditable}
      dirtyCount=${dirty.size}
      saving=${saving}
      authed=${authed}
      onSave=${save}
      onLogin=${() => setShowLogin(true)}
      onLogout=${() => {
        clearToken();
        setAuthed(false);
      }}
    />
    ${msg
      ? html`<div class=${"admin-toast admin-toast--" + msg.kind} onClick=${() => setMsg(null)}>
          ${msg.text}
        </div>`
      : null}
    <div class="admin-surface">${view}</div>
    ${cropState
      ? html`<${CropControl}
          row=${cropState.row}
          aspect=${cropState.aspect}
          onApply=${applyCrop}
          onClear=${clearCrop}
          onReplace=${replaceCropImage}
          onCancel=${() => setCropState(null)}
        />`
      : null}
    ${showLogin
      ? html`<${LoginModal}
          onOAuth=${loginOAuth}
          onToken=${loginToken}
          onClose=${() => setShowLogin(false)}
        />`
      : null}
  </div>`;
}

function LoginModal({ onOAuth, onToken, onClose }) {
  const [tok, setTok] = useState("");
  // GitHub sign-in needs the PHP OAuth proxy, which only runs on the live host.
  // On localhost the dev server can't execute PHP (the popup would just download
  // auth.php), so hide that button here and steer to the token.
  const host = location.hostname;
  const isLocal =
    /^(localhost|127\.0\.0\.1|0\.0\.0\.0|\[?::1\]?)$/.test(host) ||
    host.endsWith(".local");
  return html`<div
    class="crop-overlay"
    onClick=${(e) => {
      if (e.target === e.currentTarget) onClose();
    }}
  >
    <div class="crop-modal" style="width:min(440px,92vw)">
      <div class="crop-modal-head"><strong>Sign in to save</strong></div>
      <p style="font-size:13px;color:#6b6b72;margin-bottom:14px">
        Saving commits to GitHub, so it needs a login.
        ${isLocal
          ? html`You're on <strong>localhost</strong>, where GitHub sign-in
              can't run — paste a fine-grained token with
              <em>Contents: read & write</em> on this repo instead.`
          : html`Use GitHub sign-in below, or paste a fine-grained token with
              <em>Contents: read & write</em>.`}
      </p>
      ${!isLocal
        ? html`<button
            class="admin-btn admin-btn--primary"
            style="width:100%;margin-bottom:14px"
            onClick=${onOAuth}
          >
            Sign in with GitHub
          </button>`
        : null}
      <label style="font-size:12px;color:#8a8a92">${isLocal ? "Access token" : "Or paste an access token"}</label>
      <input
        type="password"
        class="admin-token-input"
        placeholder="github_pat_… or ghp_…"
        value=${tok}
        onInput=${(e) => setTok(e.target.value)}
      />
      <div class="crop-actions" style="margin-top:12px">
        <button class="admin-btn" onClick=${onClose}>Cancel</button>
        <button class="admin-btn admin-btn--primary" onClick=${() => onToken(tok)}>
          Use token
        </button>
      </div>
    </div>
  </div>`;
}

function BackArrow() {
  return html`<svg
    class="admin-back-arrow"
    viewBox="0 0 24 24"
    width="18"
    height="18"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path d="M19 12H5" />
    <path d="M12 19l-7-7 7-7" />
  </svg>`;
}

function Toolbar(props) {
  return html`<header class="admin-bar">
    <div class="admin-bar-left">
      ${props.isDashboard
        ? html`<span class="admin-brand">Dashboard</span>`
        : html`<a class="admin-back" href="#/"><${BackArrow} /> Dashboard</a>`}
    </div>
    <div class="admin-bar-center">
      ${!props.isDashboard
        ? html`<span class="admin-title">${props.title}</span>
            ${props.showToggle
              ? html`<span class="admin-viewtag">${props.editable ? "Edit view" : "Preview"}</span>`
              : null}`
        : null}
    </div>
    <div class="admin-bar-right">
      ${props.showToggle
        ? html`<button
            class=${"admin-btn" + (props.editable ? "" : " is-on")}
            onClick=${() => props.setEditable(!props.editable)}
          >
            ${props.editable ? "Preview" : "Edit"}
          </button>`
        : null}
      <button
        class="admin-btn admin-btn--primary"
        disabled=${props.saving || props.dirtyCount === 0}
        onClick=${props.onSave}
      >
        ${props.saving
          ? "Saving…"
          : props.dirtyCount > 0
          ? `Save (${props.dirtyCount})`
          : "Saved"}
      </button>
      ${props.authed
        ? html`<button class="admin-btn admin-link" onClick=${props.onLogout}>Sign out</button>`
        : html`<button class="admin-btn" onClick=${props.onLogin}>Sign in</button>`}
    </div>
  </header>`;
}

function Dashboard({ store, onNew }) {
  const projects = [...store.projects].sort(
    (a, b) => (a.data.order ?? 99) - (b.data.order ?? 99)
  );
  return html`<div class="admin-dash">
    <section>
      <h2>Pages</h2>
      <div class="admin-cards">
        ${PAGE_NAMES.map(
          (n) => html`<a class="admin-card" href=${"#/page/" + n} key=${n}>
            <span class="admin-card-kicker">Page</span>
            <span class="admin-card-title">${n[0].toUpperCase() + n.slice(1)}</span>
          </a>`
        )}
        <a class="admin-card" href="#/design" key="design">
          <span class="admin-card-kicker">Site</span>
          <span class="admin-card-title">Design</span>
          <span class="admin-card-sub">Fonts, text size, colors</span>
        </a>
      </div>
    </section>
    <section>
      <div class="admin-sec-head">
        <h2>Case studies</h2>
        <button class="admin-btn admin-btn--primary" onClick=${onNew}>
          + New case study
        </button>
      </div>
      <div class="admin-cards">
        ${projects.map(
          (p) => html`<a
            class="admin-card"
            href=${"#/project/" + p.slug}
            key=${p.slug}
          >
            <span class="admin-card-kicker">#${p.data.order} · ${p.slug}</span>
            <span class="admin-card-title">${p.data.title}</span>
            <span class="admin-card-sub">${p.data.card_tagline || ""}</span>
          </a>`
        )}
      </div>
    </section>
  </div>`;
}

render(html`<${App} />`, document.getElementById("app"));

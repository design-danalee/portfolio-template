// Editable render of a case-study page. Mirrors src/_includes/layouts/project.njk.
import { html } from "@/lib.js";
import { assetUrl } from "@/surface/assets.js";
import { EditableText } from "@/surface/EditableText.js";
import { Row } from "@/surface/rows.js";
import { AddRowMenu, DelBtn, AddBtn, blankRow } from "@/surface/inline/Controls.js";

function move(arr, i, dir) {
  const j = i + dir;
  if (j < 0 || j >= arr.length) return arr;
  const next = [...arr];
  const [item] = next.splice(i, 1);
  next.splice(j, 0, item);
  return next;
}
function changeRowType(old, type) {
  const nr = blankRow(type);
  if (type === "text_half") nr.text = old.text || "";
  else if (old.src) nr.src = old.src;
  return nr;
}

export function ProjectSurface({ project, editable, update, onImageClick }) {
  const d = project.data;
  // update(patch) shallow-merges into project.data
  const setData = (patch) => update(patch);

  const setListItem = (key, i, val) => {
    const arr = [...(d[key] || [])];
    arr[i] = val;
    setData({ [key]: arr });
  };
  const setSection = (si, patch) => {
    const sections = (d.sections || []).map((s, idx) =>
      idx === si ? { ...s, ...patch } : s
    );
    setData({ sections });
  };
  const setRow = (si, ri, newRow) => {
    const sections = (d.sections || []).map((s, idx) => {
      if (idx !== si) return s;
      const rows = (s.rows || []).map((r, j) => (j === ri ? newRow : r));
      return { ...s, rows };
    });
    setData({ sections });
  };
  const mutSection = (si, fn) =>
    setData({ sections: (d.sections || []).map((s, i) => (i === si ? fn(s) : s)) });

  // ---- structural ops ----
  const addSection = () => setData({ sections: [...(d.sections || []), { rows: [] }] });
  const deleteSection = (si) =>
    setData({ sections: (d.sections || []).filter((_, i) => i !== si) });
  const moveSection = (si, dir) => setData({ sections: move(d.sections || [], si, dir) });
  const addRow = (si, type) => {
    const row = blankRow(type);
    const ri = (d.sections?.[si]?.rows || []).length; // index the new row will land at
    mutSection(si, (s) => ({ ...s, rows: [...(s.rows || []), row] }));
    // Media blocks: open the file picker right away instead of leaving an
    // empty placeholder to click a second time. Passing el=null makes
    // onImageClick skip the crop tool (which needs a rendered element to
    // measure) and go straight to upload — same fallback path video/natural
    // rows already use. Crop can still be applied afterward by clicking the
    // now-populated row.
    if (type !== "text_half" && onImageClick) onImageClick(row, null, { si, ri });
  };
  const deleteRow = (si, ri) =>
    mutSection(si, (s) => ({ ...s, rows: (s.rows || []).filter((_, j) => j !== ri) }));
  const moveRow = (si, ri, dir) =>
    mutSection(si, (s) => ({ ...s, rows: move(s.rows || [], ri, dir) }));

  // ---- list-item ops (capabilities / meta) ----
  const addItem = (key) => setData({ [key]: [...(d[key] || []), ""] });
  const delItem = (key, i) =>
    setData({ [key]: (d[key] || []).filter((_, j) => j !== i) });

  return html`<article class="admin-surface-page">
    <div
      class="wide-project-image"
      style=${`background-image: url('${assetUrl(d.hero_image)}');`}
      data-editable-img=${editable && onImageClick ? "1" : undefined}
      onClick=${editable && onImageClick
        ? (e) =>
            onImageClick(
              { __hero: true, src: d.hero_image },
              e.currentTarget || e.target
            )
        : undefined}
    ></div>

    <section class="section-intro">
      <div class="col-title">
        <${EditableText}
          tag="p"
          class="hero-text mt-1"
          value=${d.title}
          editable=${editable}
          placeholder="Project title"
          onCommit=${(t) => setData({ title: t })}
        />
      </div>
      <div class="project-details col-description">
        <${EditableText}
          tag="p"
          class="hero"
          value=${d.description}
          editable=${editable}
          placeholder="Intro description"
          onCommit=${(t) => setData({ description: t })}
        />
      </div>
      <div class="col-title"></div>
      <div class="col-description">
        <div class="project-capabilities">
          <ul>
            ${(d.capabilities || []).map(
              (c, i) => html`<li key=${"cap" + i} class="li-editable">
                <${EditableText}
                  value=${c}
                  editable=${editable}
                  onCommit=${(v) => setListItem("capabilities", i, v)}
                />
                ${editable
                  ? html`<${DelBtn} title="Remove capability" onClick=${() => delItem("capabilities", i)} />`
                  : null}
              </li>`
            )}
          </ul>
          ${editable
            ? html`<${AddBtn} label="+ Add capability" onClick=${() => addItem("capabilities")} />`
            : null}
        </div>
        <div class="project-capabilities">
          <ul>
            ${(d.meta || []).map(
              (m, i) => html`<li key=${"meta" + i} class="li-editable">
                <${EditableText}
                  value=${m}
                  editable=${editable}
                  onCommit=${(v) => setListItem("meta", i, v)}
                />
                ${editable
                  ? html`<${DelBtn} title="Remove line" onClick=${() => delItem("meta", i)} />`
                  : null}
              </li>`
            )}
          </ul>
          ${editable
            ? html`<${AddBtn} label="+ Add line" onClick=${() => addItem("meta")} />`
            : null}
        </div>
      </div>
    </section>

    ${(d.sections || []).map(
      (section, si) => html`<div key=${"sec" + si} class="surf-section">
        ${editable
          ? html`<div class="section-bar">
              <span class="section-bar-label">Section ${si + 1}</span>
              <button class="rt-btn" title="Move section up" disabled=${si === 0} onClick=${() => moveSection(si, -1)}>↑</button>
              <button class="rt-btn" title="Move section down" disabled=${si === (d.sections.length - 1)} onClick=${() => moveSection(si, 1)}>↓</button>
              <button class="rt-btn rt-del" title="Delete section" onClick=${() => deleteSection(si)}>Delete section</button>
            </div>`
          : null}
        ${editable || section.heading
          ? html`<section class="section-intro">
              <div class="col-span-6 md:col-span-3">
                <${EditableText}
                  tag="h1"
                  class="hero-text"
                  value=${section.heading}
                  editable=${editable}
                  placeholder="Section heading (optional)"
                  onCommit=${(t) => setSection(si, { heading: t })}
                />
              </div>
              <div class="project-details col-span-6 md:col-span-3 md:pr-8">
                <${EditableText}
                  tag="p"
                  value=${section.body}
                  editable=${editable}
                  placeholder="Section body (optional)"
                  onCommit=${(t) => setSection(si, { body: t })}
                />
              </div>
            </section>`
          : null}
        ${(section.rows && section.rows.length) || editable
          ? html`<section class="grid grid-cols-6 gap-4 px-4 mt-16">
              ${(section.rows || []).map(
                (row, ri) => html`<${Row}
                  key=${"r" + si + "-" + ri}
                  row=${row}
                  editable=${editable}
                  onChange=${(nr) => setRow(si, ri, nr)}
                  onImageClick=${onImageClick
                    ? (r, el) => onImageClick(r, el, { si, ri })
                    : undefined}
                  tools=${{
                    canUp: ri > 0,
                    canDown: ri < section.rows.length - 1,
                    onMoveUp: () => moveRow(si, ri, -1),
                    onMoveDown: () => moveRow(si, ri, 1),
                    onDelete: () => deleteRow(si, ri),
                    onChangeType: (t) => setRow(si, ri, changeRowType(row, t)),
                    onSetNatural: (val) =>
                      setRow(si, ri, { ...row, natural_height: val }),
                  }}
                />`
              )}
              ${editable
                ? html`<div class="col-span-6 add-row-cell">
                    <${AddRowMenu} onAdd=${(t) => addRow(si, t)} />
                  </div>`
                : null}
            </section>`
          : null}
      </div>`
    )}
    ${editable
      ? html`<div class="add-section-wrap">
          <button class="add-section-btn" onClick=${addSection}>+ Add section</button>
        </div>`
      : null}
  </article>`;
}

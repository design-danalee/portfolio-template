// Editable render of the singleton pages. Mirrors index.njk / about.njk / contact.njk.
import { html } from "@/lib.js";
import { assetUrl } from "@/surface/assets.js";
import { EditableText } from "@/surface/EditableText.js";
import { DelBtn, AddBtn } from "@/surface/inline/Controls.js";

function Hero({ value, editable, onCommit }) {
  return html`<section class="introduction">
    <section class="flex">
      <${EditableText}
        tag="h1"
        class="hero-text"
        value=${value}
        editable=${editable}
        placeholder="Hero text"
        onCommit=${onCommit}
      />
    </section>
  </section>`;
}

// ---- Home -----------------------------------------------------------------
function HomeSurface({ page, editable, updatePage, projects, updateProject, navigate }) {
  const setHero = (t) => updatePage({ hero: t });
  const sorted = [...(projects || [])].sort(
    (a, b) => (a.data.order ?? 99) - (b.data.order ?? 99)
  );
  return html`<div>
    <${Hero} value=${page.data.hero} editable=${editable} onCommit=${setHero} />
    <section id="work" style="scroll-margin-top: 1rem;">
      <div class="m-4 space-y-4 snap-mandatory">
        ${sorted.map(
          (p) => html`<div key=${p.slug} class="block snap-center">
            <div
              class="case-study roundy flex"
              style=${`background-image: url('${assetUrl(p.data.card_image)}');`}
            >
              <div class="case-study-label roundy">
                <${EditableText}
                  tag="h2"
                  class="hero-text pb-2"
                  value=${p.data.card_title}
                  editable=${editable}
                  placeholder="Card title"
                  onCommit=${(t) => updateProject(p.slug, { card_title: t })}
                />
                <${EditableText}
                  tag="p"
                  class="t-body"
                  value=${p.data.card_tagline}
                  editable=${editable}
                  placeholder="Card tagline"
                  onCommit=${(t) => updateProject(p.slug, { card_tagline: t })}
                />
                ${editable
                  ? html`<button
                      class="admin-openproject"
                      onClick=${() => navigate("#/project/" + p.slug)}
                    >
                      Edit case study →
                    </button>`
                  : null}
              </div>
            </div>
          </div>`
        )}
      </div>
    </section>
  </div>`;
}

// ---- About ----------------------------------------------------------------
function AboutSurface({ page, editable, updatePage }) {
  const d = page.data;
  const setSection = (i, patch) => {
    const sections = (d.sections || []).map((s, idx) =>
      idx === i ? { ...s, ...patch } : s
    );
    updatePage({ sections });
  };
  const setTile = (i, patch) => {
    const tiles = (d.partner.tiles || []).map((t, idx) =>
      idx === i ? { ...t, ...patch } : t
    );
    updatePage({ partner: { ...d.partner, tiles } });
  };
  const setFact = (i, val) => {
    const facts = [...(d.dataPoints.facts || [])];
    facts[i] = val;
    updatePage({ dataPoints: { ...d.dataPoints, facts } });
  };
  const addSection = () =>
    updatePage({ sections: [...(d.sections || []), { heading: "", body: "" }] });
  const delSection = (i) =>
    updatePage({ sections: (d.sections || []).filter((_, j) => j !== i) });
  const addTile = () =>
    updatePage({
      partner: { ...d.partner, tiles: [...(d.partner.tiles || []), { title: "", body: "" }] },
    });
  const delTile = (i) =>
    updatePage({
      partner: { ...d.partner, tiles: (d.partner.tiles || []).filter((_, j) => j !== i) },
    });
  const addFact = () =>
    updatePage({ dataPoints: { ...d.dataPoints, facts: [...(d.dataPoints.facts || []), ""] } });
  const delFact = (i) =>
    updatePage({
      dataPoints: { ...d.dataPoints, facts: (d.dataPoints.facts || []).filter((_, j) => j !== i) },
    });
  return html`<div>
    <${Hero} value=${d.hero} editable=${editable} onCommit=${(t) => updatePage({ hero: t })} />

    ${(d.sections || []).map(
      (section, i) => html`<section class="about-section" key=${"s" + i}>
        ${editable
          ? html`<${DelBtn} title="Delete section" onClick=${() => delSection(i)} />`
          : null}
        <${EditableText}
          tag="h2"
          class="t-heading"
          value=${section.heading}
          editable=${editable}
          onCommit=${(t) => setSection(i, { heading: t })}
        />
        <${EditableText}
          tag="p"
          value=${section.body}
          editable=${editable}
          onCommit=${(t) => setSection(i, { body: t })}
        />
      </section>`
    )}
    ${editable
      ? html`<div class="m-4"><${AddBtn} label="+ Add section" onClick=${addSection} /></div>`
      : null}

    <section class="m-4 mt-64 mb-24">
      <${EditableText}
        tag="h2"
        class="hero-text mb-10"
        value=${d.partner.heading}
        editable=${editable}
        onCommit=${(t) => updatePage({ partner: { ...d.partner, heading: t } })}
      />
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        ${(d.partner.tiles || []).map(
          (tile, i) => html`<div
            key=${"t" + i}
            class="partner-tile roundy aspect-square flex flex-col justify-between li-editable"
            style="background-color: #F5F5F5;"
          >
            ${editable
              ? html`<${DelBtn} title="Delete tile" onClick=${() => delTile(i)} />`
              : null}
            <${EditableText}
              tag="h3"
              class="t-heading mb-3"
              value=${tile.title}
              editable=${editable}
              onCommit=${(t) => setTile(i, { title: t })}
            />
            <${EditableText}
              tag="p"
              value=${tile.body}
              editable=${editable}
              onCommit=${(t) => setTile(i, { body: t })}
            />
          </div>`
        )}
      </div>
      ${editable
        ? html`<div class="mt-4"><${AddBtn} label="+ Add tile" onClick=${addTile} /></div>`
        : null}
    </section>

    <section class="m-4 mt-48 mb-4">
      <${EditableText}
        tag="h2"
        class="hero-text mb-10"
        value=${d.dataPoints.heading}
        editable=${editable}
        onCommit=${(t) =>
          updatePage({ dataPoints: { ...d.dataPoints, heading: t } })}
      />
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          class="partner-tile roundy aspect-square flex items-center justify-center text-center"
          style="background-color: #F5F5F5;"
        >
          <p class="t-heading">${(d.dataPoints.facts || [])[0] || ""}</p>
        </div>
        <div
          class="partner-tile roundy aspect-square flex items-center justify-center text-center"
          style="background-color: #29292E; color: #ffffff;"
        >
          <span class="t-heading">Roll the Dice</span>
        </div>
      </div>
      ${editable
        ? html`<div class="admin-listblock">
            <p class="admin-listblock-label">All facts (edit inline)</p>
            <ul>
              ${(d.dataPoints.facts || []).map(
                (f, i) => html`<li key=${"f" + i} class="li-editable">
                  <${EditableText}
                    value=${f}
                    editable=${editable}
                    onCommit=${(v) => setFact(i, v)}
                  />
                  <${DelBtn} title="Delete fact" onClick=${() => delFact(i)} />
                </li>`
              )}
            </ul>
            <${AddBtn} label="+ Add fact" onClick=${addFact} />
          </div>`
        : null}
    </section>
  </div>`;
}

// ---- Contact --------------------------------------------------------------
const FIELD_TYPES = [
  { type: "text", label: "Short text" },
  { type: "email", label: "Email" },
  { type: "textarea", label: "Long text" },
  { type: "select", label: "Dropdown" },
];

function ContactSurface({ page, editable, updatePage }) {
  const d = page.data;
  const fields = d.fields || [];
  const setFields = (next) => updatePage({ fields: next });
  const setField = (i, patch) =>
    setFields(fields.map((f, idx) => (idx === i ? { ...f, ...patch } : f)));
  const moveField = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= fields.length) return;
    const next = [...fields];
    const [item] = next.splice(i, 1);
    next.splice(j, 0, item);
    setFields(next);
  };
  const delField = (i) => setFields(fields.filter((_, idx) => idx !== i));
  const addField = () =>
    setFields([
      ...fields,
      { id: "field_" + Date.now().toString(36), label: "New Field", type: "text", required: false },
    ]);
  const setOpt = (fi, oi, val) => {
    const opts = [...(fields[fi].options || [])];
    opts[oi] = val;
    setField(fi, { options: opts });
  };
  const addOpt = (fi) => setField(fi, { options: [...(fields[fi].options || []), ""] });
  const delOpt = (fi, oi) =>
    setField(fi, { options: (fields[fi].options || []).filter((_, j) => j !== oi) });

  return html`<div>
    <${Hero} value=${d.hero} editable=${editable} onCommit=${(t) => updatePage({ hero: t })} />
    <section class="contact-section">
      ${editable
        ? html`<div>
            <div class="admin-listblock">
              <p class="admin-listblock-label">Where form messages are sent</p>
              <p class="admin-field-label">Notification email</p>
              <${EditableText}
                class="admin-field"
                value=${d.notifyEmail}
                editable=${editable}
                placeholder="you@example.com"
                onCommit=${(t) => updatePage({ notifyEmail: t.trim() })}
              />
              <p class="admin-field-label">Email subject line</p>
              <${EditableText}
                class="admin-field"
                value=${d.formSubject}
                editable=${editable}
                placeholder="New message from your website"
                onCommit=${(t) => updatePage({ formSubject: t })}
              />
              <p class="admin-field-hint">
                Messages from your contact form go to this address. (Your email
                account's send credentials are set once on the server — see the guide.)
              </p>
            </div>
            <div class="admin-listblock">
              <p class="admin-listblock-label">Form fields</p>
              ${fields.map((field, i) => {
                const locked = !!field.locked;
                return html`<div class="field-row" key=${field.id}>
                  <div class="field-row-head">
                    <input
                      class="admin-field field-row-label"
                      type="text"
                      value=${field.label}
                      onInput=${(e) => setField(i, { label: e.target.value })}
                    />
                    <select
                      class="rt-select field-row-type"
                      title="Field type"
                      value=${field.type}
                      disabled=${locked}
                      onChange=${(e) => setField(i, { type: e.target.value })}
                    >
                      ${FIELD_TYPES.map((t) => html`<option value=${t.type}>${t.label}</option>`)}
                    </select>
                    <label class="field-row-required">
                      <input
                        type="checkbox"
                        checked=${field.required}
                        disabled=${locked}
                        onChange=${(e) => setField(i, { required: e.target.checked })}
                      />
                      Required
                    </label>
                    <button class="rt-btn" title="Move up" disabled=${i === 0} onClick=${() => moveField(i, -1)}>↑</button>
                    <button class="rt-btn" title="Move down" disabled=${i === fields.length - 1} onClick=${() => moveField(i, 1)}>↓</button>
                    ${locked
                      ? html`<span class="field-row-locked" title="An email field is required for the form to work">🔒 required</span>`
                      : html`<button class="rt-btn rt-del" title="Delete field" onClick=${() => delField(i)}>✕</button>`}
                  </div>
                  ${field.type === "select"
                    ? html`<div class="field-row-options">
                        <ul>
                          ${(field.options || []).map(
                            (opt, oi) => html`<li key=${"opt" + oi} class="li-editable">
                              <${EditableText}
                                value=${opt}
                                editable=${editable}
                                onCommit=${(v) => setOpt(i, oi, v)}
                              />
                              <${DelBtn} title="Delete option" onClick=${() => delOpt(i, oi)} />
                            </li>`
                          )}
                        </ul>
                        <${AddBtn} label="+ Add option" onClick=${() => addOpt(i)} />
                      </div>`
                    : null}
                </div>`;
              })}
              <${AddBtn} label="+ Add field" onClick=${addField} />
            </div>
          </div>`
        : html`<p style="opacity:.6">
            (The contact form renders here on the live site.)
          </p>`}
    </section>
  </div>`;
}

export function PageSurface(props) {
  switch (props.page.name) {
    case "home":
      return html`<${HomeSurface} ...${props} />`;
    case "about":
      return html`<${AboutSurface} ...${props} />`;
    case "contact":
      return html`<${ContactSurface} ...${props} />`;
    default:
      return html`<div>Unknown page</div>`;
  }
}

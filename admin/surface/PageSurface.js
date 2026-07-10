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
                  class="text-xl"
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
          class="text-4xl"
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
              class="text-2xl mb-3"
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
          <p class="text-4xl">${(d.dataPoints.facts || [])[0] || ""}</p>
        </div>
        <div
          class="partner-tile roundy aspect-square flex items-center justify-center text-center"
          style="background-color: #29292E; color: #ffffff;"
        >
          <span class="text-4xl">Roll the Dice</span>
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
function ContactSurface({ page, editable, updatePage }) {
  const d = page.data;
  const setOpt = (key, i, val) => {
    const arr = [...(d[key] || [])];
    arr[i] = val;
    updatePage({ [key]: arr });
  };
  const addOpt = (key) => updatePage({ [key]: [...(d[key] || []), ""] });
  const delOpt = (key, i) =>
    updatePage({ [key]: (d[key] || []).filter((_, j) => j !== i) });
  const OptionList = (key, label) =>
    html`<div class="admin-listblock">
      <p class="admin-listblock-label">${label}</p>
      <ul>
        ${(d[key] || []).map(
          (opt, i) => html`<li key=${key + i} class="li-editable">
            <${EditableText}
              value=${opt}
              editable=${editable}
              onCommit=${(v) => setOpt(key, i, v)}
            />
            <${DelBtn} title="Delete option" onClick=${() => delOpt(key, i)} />
          </li>`
        )}
      </ul>
      <${AddBtn} label="+ Add option" onClick=${() => addOpt(key)} />
    </div>`;
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
            ${OptionList("organizations", "Organization dropdown options")}
            ${OptionList("projects", "Project dropdown options")}
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

// Parse/serialize YAML-frontmatter markdown files (empty body in this repo).
// Pure + testable: no DOM, no network.
import yaml from "js-yaml";

const DUMP_OPTS = {
  lineWidth: -1, // don't re-wrap long strings -> clean diffs
  noRefs: true, // no anchors/aliases
  sortKeys: false, // preserve insertion order (build objects in template order)
  quotingType: '"',
  forceQuotes: false,
};

export function parseFrontmatter(text) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(text);
  if (!m) return { data: {}, body: text };
  return { data: yaml.load(m[1]) || {}, body: m[2] || "" };
}

export function stringifyFrontmatter(data, body) {
  const y = yaml.dump(data, DUMP_OPTS); // ends with a trailing newline
  return `---\n${y}---\n${body || ""}`;
}

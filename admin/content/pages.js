// Singleton JSON pages (Home / About / Contact). Serialized 2-space + trailing
// newline to match the existing files (minimal diff churn).
export const PAGE_FILES = {
  home: "src/_data/home.json",
  about: "src/_data/about.json",
  contact: "src/_data/contact.json",
};

export function makePages(contents) {
  return {
    files: PAGE_FILES,
    async load(name) {
      const { text, sha } = await contents.read(PAGE_FILES[name]);
      return { name, path: PAGE_FILES[name], sha, data: JSON.parse(text) };
    },
  };
}

export function serializePage(page) {
  return JSON.stringify(page.data, null, 2) + "\n";
}

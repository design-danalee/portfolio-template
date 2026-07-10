// Shared defaults for every project in src/projects/.
// The output URL is derived from the filename (e.g. shipium.md -> shipium.html),
// so a project created in the CMS automatically gets the right URL.
module.exports = {
  tags: ["project"],
  layout: "layouts/project.njk",
  eleventyComputed: {
    permalink: (data) => data.permalink || `${data.page.fileSlug}.html`,
  },
};

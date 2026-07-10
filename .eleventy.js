module.exports = function (eleventyConfig) {
  // Copy static assets straight through to the build output.
  // Paths are relative to the project root (not the input dir).
  const passthrough = [
    "assets",
    "main.css",
    "size-small.css",
    "size-large.css",
    "dotcursor.js",
    "random-colors.js",
    "header.js",
    "favicon.js",
    "index.css",
    "about.css",
    "about.js",
    "contact.css",
    "contact.js",
    "contact.php",
    "admin",
    "oauth",
  ];
  passthrough.forEach((p) => eleventyConfig.addPassthroughCopy(p));

  // Let the dev server know about asset changes.
  eleventyConfig.addWatchTarget("./main.css");
  eleventyConfig.addWatchTarget("./size-small.css");
  eleventyConfig.addWatchTarget("./size-large.css");

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    templateFormats: ["njk", "md", "html"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
};

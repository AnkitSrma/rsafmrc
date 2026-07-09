const MarkdownIt = require("markdown-it");
const md = new MarkdownIt({ html: false, linkify: true });

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });

  eleventyConfig.addFilter("markdown", (value) => (value ? md.render(value) : ""));
  eleventyConfig.addFilter("markdownInline", (value) => (value ? md.renderInline(value) : ""));

  eleventyConfig.addFilter("year", () => new Date().getFullYear());
  eleventyConfig.addFilter("dateYear", (d) => (d ? new Date(d).getFullYear() : ""));
  eleventyConfig.addFilter("dateLong", (d) =>
    d ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" }) : ""
  );
  eleventyConfig.addFilter("excerpt", (mdText, len = 140) => {
    if (!mdText) return "";
    const plain = mdText.replace(/[#*_>`[\]]/g, "").replace(/\s+/g, " ").trim();
    return plain.length > len ? `${plain.slice(0, len).trim()}…` : plain;
  });

  const strapiBase = process.env.STRAPI_URL || "http://localhost:1337";
  eleventyConfig.addFilter("mediaUrl", (media) => {
    const url = media && media.url;
    if (!url) return "";
    return /^https?:\/\//.test(url) ? url : `${strapiBase}${url}`;
  });

  // Mirrors the original flat-file URL convention (about.html, not /about/)
  // so existing links/bookmarks keep working after the migration.
  eleventyConfig.addFilter("pageHref", (slug) => (slug === "home" ? "index.html" : `${slug}.html`));
  eleventyConfig.addFilter("postHref", (slug) => `posts/${slug}.html`);

  // Nunjucks has no Jinja2-style array[1:3] slice syntax — a parse error on
  // that expression silently blanks the whole template, so use a filter.
  eleventyConfig.addFilter("slice", (arr, start, end) => (arr || []).slice(start, end));

  // Featured posts, ordered by the editor's manual `order` override first
  // (falls back to newest-first) — lets an older-but-more-significant post
  // (e.g. the founding meeting) outrank a newer one in the spotlight.
  eleventyConfig.addFilter("byFeaturedOrder", (posts) =>
    posts
      .filter((p) => p.featured)
      .slice()
      .sort((a, b) => {
        const orderA = a.order ?? 999;
        const orderB = b.order ?? 999;
        if (orderA !== orderB) return orderA - orderB;
        return new Date(b.date) - new Date(a.date);
      })
  );

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
  };
};

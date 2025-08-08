require("dotenv").config();

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addGlobalData("recaptchaSiteKey", process.env.GOOGLE_SITE_KEY);
  eleventyConfig.addGlobalData("formId", process.env.FORM_ID);

  return {
    passthroughFileCopy: true,
    markdownTemplateEngine: "njk",
    templateFormats: ["html", "njk", "md"],
    dir: {
      input: "src",
      output: "_site",
      include: "includes",
    },
  };
};

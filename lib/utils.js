const path = require("path");

const parseConfig = config => ({
  isCreateWebp: config.webp === "true",
  imageSizes: config.sizes.split("\n"),
  jpegQuality: parseInt(config.jpegQuality, 10),
  pngCompressionLevel: parseInt(config.pngCompressionLevel, 10),
  progressive: config.progressive === "true",
  saveOriginal: config.saveOriginal === "true",
  resize: config.resize === "true",
  fit: config.fit,
  convertToJpg: config.convertToJpg === "true"
});

const ORIGINAL_SUFFIX = "-original";
const OPTIMIZED_SUFFIX = "-optimized";
const UPLOAD_FOLDER = path.join(strapi.config.public.path, "uploads");

module.exports = {
  parseConfig,
  ORIGINAL_SUFFIX,
  UPLOAD_FOLDER,
  OPTIMIZED_SUFFIX
};

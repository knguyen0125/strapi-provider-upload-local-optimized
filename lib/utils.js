const path = require("path");

const parseConfig = config => ({
  isCreateWebp: config.webp === "true",
  aspectRatios: config.aspectRatio.split("\n"),
  jpegQuality: parseInt(config.jpegQuality, 10),
  pngCompressionLevel: parseInt(config.pngCompressionLevel, 10),
  progressive: config.progressive === "true",
  saveOriginal: config.saveOriginal === "true",
  resize: config.resize === "true",
  fit: config.fit,
  convertToJpg: config.convertToJpg === "true",
  uploadFolder: config.uploadFolder,
});

const ORIGINAL_SUFFIX = "-original";
const OPTIMIZED_SUFFIX = "-optimized";

module.exports = {
  parseConfig,
  ORIGINAL_SUFFIX,
  OPTIMIZED_SUFFIX
};

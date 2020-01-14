module.exports = {
  webp: {
    label: "Generate WebP Image",
    type: "enum",
    values: ["true", "false"]
  },
  saveOriginal: {
    label: "Save Original",
    type: "enum",
    values: ["true", "false"]
  },
  resize: {
    label: "Resize Image",
    type: "enum",
    values: ["true", "false"]
  },
  fit: {
    label: "Resize Fit",
    type: "enum",
    values: ["cover", "contain", "fill", "inside", "outside"]
  },
  aspectRatio: {
    label: "Aspect Ratio (1 per line)",
    type: "textarea",
    required: false
  },
  jpegQuality: {
    label: "JPG/JPEG Quality",
    type: "number",
    min: 10,
    max: 100,
    default: 80
  },
  pngCompressionLevel: {
    label: "PNG Compression Level",
    type: "number",
    min: 0,
    max: 9,
    default: 6
  },
  progressive: {
    label: "JPG/PNG Progressive",
    type: "enum",
    values: ["true", "false"]
  },
  convertToJpg: {
    label: "Convert to JPG",
    type: "enum",
    values: ["true", "false"]
  },
  uploadFolder: {
    label: "Upload Folder",
    type: "string"
  }
};

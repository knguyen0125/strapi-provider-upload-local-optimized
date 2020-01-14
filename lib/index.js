"use strict";

const sharp = require("sharp");

module.exports = {
  provider: "local-optimized",
  name: "Local Optimized",
  auth: {
    webp: {
      label: "Generate WebP",
      type: "enum",
      values: ["true", "false"]
    },
    sizes: {
      label: "Sizes",
      type: "textarea"
    },
    quality: {
      label: "Quality",
      type: "number",
      min: 10,
      max: 100
    }
  },
  init: config => {
    console.log(config);

    return {
      upload: async file => file,
      delete: async file => file
    };
  }
};

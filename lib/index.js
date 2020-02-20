"use strict";

const createUpload = require("./upload");
const createDelete = require("./delete");

module.exports = {
  provider: "local-optimized",
  name: "Local Optimized",
  auth: {},
  init: config => {
    return {
      upload: createUpload(config),
      delete: createDelete(config)
    };
  }
};

"use strict";

const authConfig = require("./config");
const createUpload = require("./upload");
const createDelete = require("./delete");

module.exports = {
  provider: "local-optimized",
  name: "Local Optimized",
  auth: authConfig,
  init: config => {
    return {
      upload: createUpload(config),
      delete: createDelete(config)
    };
  }
};

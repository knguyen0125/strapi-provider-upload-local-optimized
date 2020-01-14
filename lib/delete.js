const fs = require("fs");
const path = require("path");
const {
  parseConfig,
  ORIGINAL_SUFFIX,
  OPTIMIZED_SUFFIX,
} = require("./utils");
const uniq = require("lodash/uniq");

const getFilesToDelete = async (file, config) => {
  const { aspectRatios, uploadFolder } = parseConfig(
    config
  );

  const suffixes = new Set();
  aspectRatios.forEach(size => {
    let [width, height] = size.split("by").map(x => Number(x));
    suffixes.add(`-${width}by${height}`);
  });

  suffixes.add(OPTIMIZED_SUFFIX);
  suffixes.add(ORIGINAL_SUFFIX);

  const exts = new Set();
  exts.add(file.ext);
  // In case isCreateWebp option is enabled
  exts.add(".webp");
  // In case convertToJpg is enabled
  exts.add(".jpg");
  exts.add(".jpeg");

  const filesToDelete = [];

  suffixes.forEach(suffix => {
    exts.forEach(ext => {
      const pathName = path.join(
        strapi.config.public.path,
        uploadFolder,
        `${file.hash}${suffix}${ext}`
      );

      if (fs.existsSync(pathName)) {
        filesToDelete.push(pathName);
      }
    });
  });

  return uniq(filesToDelete);
};

const createDelete = config => async file => {
  const filesToDelete = await getFilesToDelete(file, config);

  const promises = filesToDelete.map(async fileToDelete => {
    return new Promise((resolve, reject) => {
      fs.unlink(fileToDelete, err => {
        if (err) return reject(err);
        resolve();
      });
    });
  });

  return new Promise((resolve, reject) => {
    Promise.all(promises)
      .then(() => resolve())
      .catch(err => reject(err));
  });
};

module.exports = createDelete;

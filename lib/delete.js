const fs = require("fs");
const path = require("path");
const {
  parseConfig,
  ORIGINAL_SUFFIX,
  OPTIMIZED_SUFFIX,
  UPLOAD_FOLDER
} = require("./utils");
const uniq = require("lodash/uniq");

const getSizesToDelete = async (file, config) => {
  const { imageSizes, saveOriginal, resize, convertToJpg } = parseConfig(
    config
  );

  const suffixes = [];
  if (resize) {
    imageSizes.forEach(size => {
      let [width, height] = size.split("x").map(x => parseInt(x, 10));
      suffixes.push(`-${width}-${height}`);
    });
  }
  if (saveOriginal) {
    suffixes.push(OPTIMIZED_SUFFIX);
    suffixes.push(ORIGINAL_SUFFIX);
  }

  const exts = [];
  exts.push(file.ext);
  if (isCreateWebp) exts.push(".webp");
  if (convertToJpg) {
    exts.push(".jpg");
    exts.push(".jpeg");
  }

  const filesToDelete = [];

  suffixes.forEach(suffix => {
    exts.forEach(ext => {
      const pathName = path.join(
        strapi.config.public.path,
        "uploads",
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
  const filesToDelete = await getSizesToDelete(file, config);

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

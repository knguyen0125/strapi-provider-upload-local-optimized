const fs = require("fs");
const path = require("path");
const uniq = require("lodash/uniq");
const { UPLOAD_FOLDER } = require("./utils");

const getFilesToDelete = async file => {
  const exts = new Set();
  exts.add(file.ext);
  exts.add(".webp");
  exts.add(".jpg");
  exts.add(".jpeg");
  exts.add(".png");

  const filesToDelete = [];

  exts.forEach(ext => {
    const pathName = path.join(
      strapi.config.public.path,
      UPLOAD_FOLDER,
      `${file.hash}${ext}`
    );

    if (fs.existsSync(pathName)) {
      filesToDelete.push(pathName);
    }
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

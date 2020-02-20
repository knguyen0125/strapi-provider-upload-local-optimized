const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const { UPLOAD_FOLDER } = require("./utils");

const transformImage = async (buffer, file, config) => {
  let pipeline = sharp(buffer);

  if (config.isCreateWebp) {
    pipeline.webp({ quality: config.jpegQuality });
  } else {
    switch (file.ext) {
      case ".png":
        pipeline.png({
          quality: 80,
          compressionLevel: 6,
          progressive: true
        });
        break;
      case ".jpeg":
      case ".jpg":
        pipeline.jpeg({
          quality: 80,
          progressive: true
        });
        break;
    }
  }

  const data = await pipeline.toBuffer();

  return {
    buffer: data,
    mime: config.isCreateWebp ? "image/webp" : file.mime,
    ext: config.isCreateWebp ? ".webp" : file.ext
  };
};

const makeSizes = async file => {
  const isCreateWebp = true;

  const buffer = new Buffer(file.buffer, "binary");

  const imagesToCreate = [];

  imagesToCreate.push(
    transformImage(buffer, file, {
      resize: false
    })
  );

  imagesToCreate.push(
    transformImage(buffer, file, {
      resize: false,
      isCreateWebp
    })
  );

  return Promise.all(imagesToCreate);
};

const createUpload = () => async file => {
  const sizes = await makeSizes(file);

  const promises = sizes.map(image => {
    return new Promise((resolve, reject) => {
      fs.writeFile(
        path.join(
          strapi.config.public.path,
          UPLOAD_FOLDER,
          `${file.hash}${image.ext}`
        ),
        image.buffer,
        err => {
          if (err) return reject(err);
          resolve();
        }
      );
    });
  });

  return new Promise((resolve, reject) => {
    Promise.all(promises)
      .then(() => {
        // Set the URL of file to original
        file.url = `/${UPLOAD_FOLDER}/${file.hash}${file.ext}`;
        resolve();
      })
      .catch(err => reject(err));
  });
};

module.exports = createUpload;

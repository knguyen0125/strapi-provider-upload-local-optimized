const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const {
  parseConfig,
  ORIGINAL_SUFFIX,
  OPTIMIZED_SUFFIX,
  UPLOAD_FOLDER
} = require("./utils");
const flattenDeep = require("lodash/flattenDeep");

const transformImage = async (buffer, file, config) => {
  let pipeline = sharp(buffer);

  if (config.resize) {
    pipeline.resize(config.width, config.height, {
      fit: sharp.fit[config.fit],
      withoutEnlargement: true
    });
  }

  if (config.isCreateWebp) {
    pipeline.webp({ quality: config.jpegQuality });
  } else {
    switch (file.ext) {
      case ".png":
        pipeline.png({
          quality: config.jpegQuality,
          compressionLevel: config.pngCompressionLevel,
          progressive: config.progressive
        });
        break;
      case ".jpeg":
      case ".jpg":
        pipeline.jpeg({
          quality: config.jpegQuality,
          progressive: config.progressive
        });
        break;
    }
  }

  return await pipeline.toBuffer().then(data => ({
    buffer: data,
    mime: config.isCreateWebp ? "image/webp" : file.mime,
    ext: config.isCreateWebp ? ".webp" : file.ext,
    suffix: config.resize
      ? `-${config.width}-${config.height}`
      : OPTIMIZED_SUFFIX
  }));
};

const makeSizes = async (file, config) => {
  const {
    isCreateWebp,
    imageSizes,
    jpegQuality,
    pngCompressionLevel,
    progressive,
    saveOriginal,
    resize,
    fit
  } = parseConfig(config);

  const buffer = new Buffer(file.buffer, "binary");

  const imagesToCreate = [];

  if (resize) {
    imageSizes.forEach(async size => {
      let [width, height] = size.split("x").map(x => parseInt(x, 10));
      imagesToCreate.push(
        await transformImage(buffer, file, {
          resize: true,
          width,
          height,
          jpegQuality,
          pngCompressionLevel,
          progressive,
          fit
        })
      );

      imagesToCreate.push(
        await transformImage(buffer, file, {
          resize: true,
          width,
          height,
          jpegQuality,
          pngCompressionLevel,
          progressive,
          isCreateWebp,
          fit
        })
      );
    });
  }

  // Adding the original
  if (saveOriginal) {
    imagesToCreate.push(
      await transformImage(buffer, file, {
        resize: false,
        jpegQuality,
        pngCompressionLevel,
        progressive,
        fit
      })
    );

    imagesToCreate.push(
      await transformImage(buffer, file, {
        resize: false,
        jpegQuality,
        pngCompressionLevel,
        progressive,
        isCreateWebp,
        fit
      })
    );

    imagesToCreate.push({
      buffer: file.buffer,
      ext: file.ext,
      suffix: ORIGINAL_SUFFIX
    });
  }

  return Promise.all(flattenDeep(imagesToCreate));
};

const upload = config => async file => {
  const sizes = await makeSizes(file, config);

  const promises = sizes.map(image => {
    return new Promise((resolve, reject) => {
      fs.writeFile(
        path.join(UPLOAD_FOLDER, `${file.hash}${image.suffix}${image.ext}`),
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
        file.url = `/uploads/${file.hash}${ORIGINAL_SUFFIX}${file.ext}`;
        resolve();
      })
      .catch(err => reject(err));
  });
};

module.exports = upload;

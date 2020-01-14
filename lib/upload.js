const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const {
  parseConfig,
  ORIGINAL_SUFFIX,
  OPTIMIZED_SUFFIX,
} = require("./utils");
const flattenDeep = require("lodash/flattenDeep");

const transformImage = async (buffer, file, config) => {
  let pipeline = sharp(buffer);

  const stats = await pipeline.clone().metadata();

  if (config.resize) {
    if (config.width >= config.height) {
      let width = Math.round((stats.height / config.height) * config.width);
      let height = stats.height;

      if (width > stats.width) {
        let resizeRatio = stats.width / width;
        width = Math.round(width * resizeRatio);
        height = Math.round(height * resizeRatio);
      }

      pipeline.resize(width, height, {
        fit: sharp.fit[config.fit],
        withoutEnlargement: false
      });
    } else {
      let width = stats.width;
      let height = Math.round((stats.width / config.width) * config.height);

      if (height > stats.height) {
        let resizeRatio = stats.height / height;
        width = Math.round(width * resizeRatio);
        height = Math.round(height * resizeRatio);
      }

      pipeline.resize(width, height, {
        fit: sharp.fit[config.fit],
        withoutEnlargement: false
      });
    }
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

  const data = await pipeline.toBuffer();

  return {
    buffer: data,
    mime: config.isCreateWebp ? "image/webp" : file.mime,
    ext: config.isCreateWebp ? ".webp" : file.ext,
    suffix: config.resize
      ? `-${config.width}by${config.height}`
      : OPTIMIZED_SUFFIX
  };
};

const makeSizes = async (file, parsedConfig) => {
  const {
    isCreateWebp,
    aspectRatios,
    jpegQuality,
    pngCompressionLevel,
    progressive,
    saveOriginal,
    resize,
    fit
  } = parsedConfig;

  const buffer = new Buffer(file.buffer, "binary");

  const imagesToCreate = [];

  if (resize) {
    aspectRatios.forEach(size => {
      let [width, height] = size.split("by").map(x => Number(x));
      imagesToCreate.push(
        transformImage(buffer, file, {
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
        transformImage(buffer, file, {
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

  imagesToCreate.push(
    transformImage(buffer, file, {
      resize: false,
      jpegQuality,
      pngCompressionLevel,
      progressive,
      fit
    })
  );

  imagesToCreate.push(
    transformImage(buffer, file, {
      resize: false,
      jpegQuality,
      pngCompressionLevel,
      progressive,
      isCreateWebp,
      fit
    })
  );

  // Adding the original
  if (saveOriginal) {
    imagesToCreate.push({
      buffer: file.buffer,
      ext: file.ext,
      suffix: ORIGINAL_SUFFIX
    });
  }

  return Promise.all(imagesToCreate);
};

const upload = config => async file => {
  const parsedConfig = parseConfig(config);
  const sizes = await makeSizes(file, parsedConfig);

  const promises = sizes.map(image => {
    return new Promise((resolve, reject) => {
      fs.writeFile(
        path.join(
          strapi.config.public.path,
          parsedConfig.uploadFolder,
          `${file.hash}${image.suffix}${image.ext}`),
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
        if (parsedConfig.saveOriginal) {
          file.url = `/${parsedConfig.uploadFolder}/${file.hash}${ORIGINAL_SUFFIX}${file.ext}`;
        } else {
          file.url = `/${parsedConfig.uploadFolder}/${file.hash}${OPTIMIZED_SUFFIX}${file.ext}`;
        }
        resolve();
      })
      .catch(err => reject(err));
  });
};

module.exports = upload;

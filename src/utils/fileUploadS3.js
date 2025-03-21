const S3 = require("aws-sdk/clients/s3");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const unlink = require("util").promisify(fs.unlink);
const uuid = require("uuid").v4;

const appConfig = require("../../configs/app.config");
const serializeHttpResponse = require("../helpers/serialize-http-response");
const { resize } = require("./sharp");
const { generateScreenshot, getVideoDuration } = require("./ffmpeg");

const s3 = new S3({
  credentials: {
    accessKeyId: appConfig.s3.accessKeyId,
    secretAccessKey: appConfig.s3.accessKeySecret,
  },
  region: "ap-south-1",
  s3ForcePathStyle: true,
});

const storage = multer.diskStorage({
  destination: appConfig.fileUploadPath,
  filename: (req, file, cb) => cb(null, `famelinks-${uuid()}`),
});

const upload = multer({ storage });

exports.uploadFamelinksMedia = (req, res, next) => {
  upload.fields([
    {
      name: "closeUp",
      maxCount: 1,
    },
    {
      name: "medium",
      maxCount: 1,
    },
    {
      name: "long",
      maxCount: 1,
    },
    {
      name: "pose1",
      maxCount: 1,
    },
    {
      name: "pose2",
      maxCount: 1,
    },
    {
      name: "additional",
      maxCount: 1,
    },
    {
      name: "video",
      maxCount: 1,
    },
  ])(req, res, async (err) => {
    if (err) {
      return next(
        serializeHttpResponse(500, {
          message: "Server Error",
          error: err,
        })
      );
    }

    try {
      if (req.body.challengeId) {
        req.body.challengeId = JSON.parse(req.body.challengeId);
      }
    } catch (error) {
      return next(
        serializeHttpResponse(400, {
          message: "Invalid Challenge List",
          error: err,
        })
      );
    }

    let s3Files = [];
    let filesToUnlink = [];
    let videoPath;
    if (req.files) {
      Object.keys(req.files).forEach((item) => {
        if (req.files[item] && req.files[item][0]) {
          req.files[item] = req.files[item][0].filename;
          const filePath = path.resolve(`uploads/${req.files[item]}`);
          filesToUnlink.push(filePath);
          if (item !== "video") {
            const resizedImages = resize(filePath, req.files[item]);
            s3Files = s3Files.concat(resizedImages);
          } else {
            videoPath = filePath;
            const videoStream = fs.createReadStream(filePath);
            s3Files.push({
              Key: req.files[item],
              Body: videoStream,
              isOriginal: true,
            });
          }
        }
      });
    }

    if (videoPath) {
      try {
        const durationInSec = await getVideoDuration(videoPath);
        const splitDuration = durationInSec / 6;
        await Promise.all(
          [0, 1, 2, 3, 4].map(async (_item, index) => {
            let suffix = index;
            if (!index) {
              suffix = "";
            }
            await generateScreenshot(
              videoPath,
              splitDuration * (index + 1),
              suffix
            );
            return;
          })
        );
      } catch (error) {
        return next(
          serializeHttpResponse(500, {
            message: "Something went wrong when taking screenshot famelinks",
            error,
          })
        );
      }
    }

    try {
      await Promise.all(
        s3Files.map((file) => {
          return s3
            .upload({
              Key: file.Key,
              Body: file.Body,
              Bucket: `${appConfig.s3.bucket.name}/${appConfig.s3.bucket.famelinks}`,
              ACL: "public-read",
            })
            .promise();
        })
      );
    } catch (err) {
      return next(
        serializeHttpResponse(500, {
          message: "Something went wrong when uploading famelinks",
          error: err,
        })
      );
    }

    if (videoPath) {
      const ssPath = `${videoPath}_screenshot.png`;
      const resizedImages = resize(ssPath, req.files.video);

      const otherScreenshots = [1, 2, 3, 4].map((item, index) => ({
        Key: `${req.files.video}-${index + 1}`,
        Body: fs.readFileSync(
          path.resolve(`${videoPath}_screenshot${index + 1}.png`)
        ),
        isOriginal: false,
      }));

      try {
        await Promise.all(
          resizedImages.concat(otherScreenshots).map((file) => {
            if (!file.isOriginal) {
              return s3
                .upload({
                  Key: file.Key,
                  Body: file.Body,
                  Bucket: `${appConfig.s3.bucket.name}/${appConfig.s3.bucket.famelinks}`,
                  ACL: "public-read",
                })
                .promise();
            }
            return;
          })
        );
        await unlink(ssPath);
        await Promise.all(
          [1, 2, 3, 4].map((item, index) =>
            unlink(path.resolve(`${videoPath}_screenshot${index + 1}.png`))
          )
        );
      } catch (err) {
        return next(
          serializeHttpResponse(500, {
            message: "Something went wrong when uploading famelinks thumbnail",
            error: err,
          })
        );
      }
    }
    if (filesToUnlink.length) {
      await Promise.all(filesToUnlink.map((file) => unlink(file)));
    }
    return next();
  });
};

exports.uploadProfileImage = (req, res, next) => {
  upload.fields([
    {
      name: "profileImage",
      maxCount: 1,
    },
  ])(req, res, async (err) => {
    if (err) {
      return serializeHttpResponse(500, {
        message: "Server Error",
        error: err,
      });
    }

    try {
      if (req.body.clubCategory) {
        req.body.clubCategory = JSON.parse(req.body.clubCategory);
      }
    } catch (error) {
      return next(
        serializeHttpResponse(400, {
          message: "Invalid club category list",
          error: err,
        })
      );
    }

    if (req.files && req.files.profileImage && req.files.profileImage[0]) {
      req.files.profileImage = req.files.profileImage[0].filename;
    }

    if (req.files && req.files.profileImage) {
      const filePath = path.resolve(`uploads/${req.files.profileImage}`);
      const resizedImages = resize(filePath, req.files.profileImage);
      try {
        await Promise.all(
          resizedImages.map(async (file) => {
            await s3
              .upload({
                Key: file.Key,
                Body: file.Body,
                Bucket: `${appConfig.s3.bucket.name}/${appConfig.s3.bucket.profile}`,
                ACL: "public-read",
              })
              .promise();
            if (file.isOriginal) {
              await unlink(path.resolve(`uploads/${file.Key}`));
            }
            return;
          })
        );
      } catch (err) {
        return next(
          serializeHttpResponse(500, {
            message: "Something went wrong when uploading profile image",
            error: err,
          })
        );
      }
    }
    return next();
  });
};

exports.uploadFunlinkMedia = (req, res, next) => {
  upload.fields([
    {
      name: "video",
      maxCount: 1,
    },
    {
      name: "audio",
      maxCount: 1,
    },
  ])(req, res, async (err) => {
    if (err) {
      return serializeHttpResponse(500, {
        message: "Server Error",
        error: err,
      });
    }
    if (req.files.video && req.files.video[0]) {
      req.files.video = req.files.video[0].filename;
    }
    if (req.files.audio && req.files.audio[0]) {
      req.files.audio = req.files.audio[0].filename;
    }

    try {
      if (req.body.challenges) {
        req.body.challenges = JSON.parse(req.body.challenges);
      }

      if (req.body.tags) {
        req.body.tags = JSON.parse(req.body.tags);
      }

      if (req.body.talentCategory) {
        req.body.talentCategory = JSON.parse(req.body.talentCategory);
      }
    } catch (error) {
      return next(
        serializeHttpResponse(400, {
          message: "Invalid Challenge List",
          error: error.message,
        })
      );
    }

    if (req.files.video) {
      const videoPath = path.resolve(`uploads/${req.files.video}`);
      try {
        const durationInSec = await getVideoDuration(videoPath);
        const splitDuration = durationInSec / 6;
        await Promise.all(
          [0, 1, 2, 3, 4].map(async (_item, index) => {
            let suffix = index;
            if (!index) {
              suffix = "";
            }
            await generateScreenshot(
              videoPath,
              splitDuration * (index + 1),
              suffix
            );
            return;
          })
        );
        const videoStream = fs.createReadStream(videoPath);
        await s3
          .upload({
            Key: req.files.video,
            Body: videoStream,
            Bucket: `${appConfig.s3.bucket.name}/${appConfig.s3.bucket.funlinks}`,
            ACL: "public-read",
          })
          .promise();

        const ssPath = `${videoPath}_screenshot.png`;
        const resizedImages = resize(ssPath, req.files.video);

        const otherScreenshots = [1, 2, 3, 4].map((item, index) => ({
          Key: `${req.files.video}-${index + 1}`,
          Body: fs.readFileSync(
            path.resolve(`${videoPath}_screenshot${index + 1}.png`)
          ),
          isOriginal: false,
        }));

        try {
          await Promise.all(
            resizedImages.concat(otherScreenshots).map((file) => {
              if (!file.isOriginal) {
                return s3
                  .upload({
                    Key: file.Key,
                    Body: file.Body,
                    Bucket: `${appConfig.s3.bucket.name}/${appConfig.s3.bucket.funlinks}`,
                    ACL: "public-read",
                  })
                  .promise();
              }
              return;
            })
          );
          await unlink(videoPath);
          await unlink(ssPath);
          await Promise.all(
            [1, 2, 3, 4].map((item, index) =>
              unlink(path.resolve(`${videoPath}_screenshot${index + 1}.png`))
            )
          );
        } catch (err) {
          return next(
            serializeHttpResponse(500, {
              message: "Something went wrong when uploading funlink thumbnail",
              error: err,
            })
          );
        }
      } catch (err) {
        return next(
          serializeHttpResponse(500, {
            message: "Something went wrong when uploading funlinks video",
            error: err,
          })
        );
      }
    }

    if (req.files.audio) {
      try {
        const audioPath = path.resolve(`uploads/${req.files.audio}`);
        const audioStream = fs.createReadStream(audioPath);
        await s3
          .upload({
            Key: req.files.audio,
            Body: audioStream,
            Bucket: `${appConfig.s3.bucket.name}/${appConfig.s3.bucket.funlinksMusic}`,
            ACL: "public-read",
          })
          .promise();
        await unlink(audioPath);
      } catch (err) {
        return next(
          serializeHttpResponse(500, {
            message: "Something went wrong when uploading funlinks audio",
            error: err,
          })
        );
      }
    }
    return next();
  });
};

exports.uploadVerificationVideo = (req, res, next) => {
  upload.fields([
    {
      name: "video",
      maxCount: 1,
    },
  ])(req, res, async (err) => {
    if (err) {
      return serializeHttpResponse(500, {
        message: "Server Error",
        error: err,
      });
    }
    if (req.files && req.files.video && req.files.video[0]) {
      req.files.video = req.files.video[0].filename;
    }

    if (req.files && req.files.video) {
      const filePath = path.resolve(`uploads/${req.files.video}`);
      try {
        const videoStream = fs.createReadStream(filePath);
        await s3
          .upload({
            Key: req.files.video,
            Body: videoStream,
            Bucket: `${appConfig.s3.bucket.name}/${appConfig.s3.bucket.profile}`,
            ACL: "public-read",
          })
          .promise();
        await unlink(filePath);
      } catch (err) {
        return next(
          serializeHttpResponse(500, {
            message: "Something went wrong when uploading verification video",
            error: err,
          })
        );
      }
    }
    return next();
  });
};

exports.uploadFollowlinksMedia = (req, res, next) => {
  upload.array("media", 10)(req, res, async (err) => {
    if (err) {
      return next(
        serializeHttpResponse(500, {
          message: "Server Error",
          error: err,
        })
      );
    }

    try {
      if (req.body.challenges) {
        req.body.challenges = JSON.parse(req.body.challenges);
      }

      if (req.body.tags) {
        req.body.tags = JSON.parse(req.body.tags);
      }
    } catch (error) {
      return next(
        serializeHttpResponse(400, {
          message: "Invalid Challenge List",
          error: err,
        })
      );
    }

    const finalFiles = [];
    let filesToUnlink = [];
    let s3Files = [];
    let videoPath = [];
    if (req.files) {
      req.files.forEach((file) => {
        if (file) {
          const item = file.filename;
          const filePath = path.resolve(`uploads/${item}`);
          filesToUnlink.push(filePath);
          if (!(file.mimetype.split("video").length - 1)) {
            const resizedImages = resize(filePath, item);
            s3Files = s3Files.concat(resizedImages);
            finalFiles.push({
              type: "image",
              media: item,
            });
          } else {
            videoPath.push(filePath);
            const videoStream = fs.createReadStream(filePath);
            s3Files.push({
              Key: item,
              Body: videoStream,
              isOriginal: true,
            });
            finalFiles.push({
              type: "video",
              media: item,
            });
          }
        }
      });
    }

    if (videoPath && videoPath.length) {
      await Promise.all(
        videoPath.map(async (vPath) => {
          const durationInSec = await getVideoDuration(vPath);
          const splitDuration = durationInSec / 6;
          await Promise.all(
            [0, 1, 2, 3, 4].map(async (_item, index) => {
              let suffix = index;
              if (!index) {
                suffix = "";
              }
              await generateScreenshot(
                vPath,
                splitDuration * (index + 1),
                suffix
              );
              return;
            })
          );
        })
      );
    }

    try {
      await Promise.all(
        s3Files.map((file) => {
          return s3
            .upload({
              Key: file.Key,
              Body: file.Body,
              Bucket: `${appConfig.s3.bucket.name}/${appConfig.s3.bucket.followlinks}`,
              ACL: "public-read",
            })
            .promise();
        })
      );
    } catch (err) {
      return next(
        serializeHttpResponse(500, {
          message: "Something went wrong when uploading followlinks",
          error: err,
        })
      );
    }

    if (videoPath && videoPath.length) {
      try {
        await Promise.all(
          videoPath.map(async (vPath) => {
            const ssPath = `${vPath}_screenshot.png`;
            const key = path.parse(vPath).name;
            const resizedImages = resize(ssPath, key);

            const otherScreenshots = [1, 2, 3, 4].map((item, index) => ({
              Key: `${key}-${index + 1}`,
              Body: fs.readFileSync(
                path.resolve(`${vPath}_screenshot${index + 1}.png`)
              ),
              isOriginal: false,
            }));

            await Promise.all(
              resizedImages.concat(otherScreenshots).map((file) => {
                if (!file.isOriginal) {
                  return s3
                    .upload({
                      Key: file.Key,
                      Body: file.Body,
                      Bucket: `${appConfig.s3.bucket.name}/${appConfig.s3.bucket.followlinks}`,
                      ACL: "public-read",
                    })
                    .promise();
                }
                return;
              })
            );
            await unlink(ssPath);
            await Promise.all(
              [1, 2, 3, 4].map((item, index) =>
                unlink(path.resolve(`${videoPath}_screenshot${index + 1}.png`))
              )
            );
          })
        );
      } catch (err) {
        return next(
          serializeHttpResponse(500, {
            message:
              "Something went wrong when uploading followlinks thumbnail",
            error: err,
          })
        );
      }
    }

    if (filesToUnlink.length) {
      await Promise.all(filesToUnlink.map((file) => unlink(file)));
    }
    req.files = finalFiles;
    return next();
  });
};

exports.uploadBannerMedia = (req, res, next) => {
  upload.array("media", 10)(req, res, async (err) => {
    if (err) {
      return next(
        serializeHttpResponse(500, {
          message: "Server Error",
          error: err,
        })
      );
    }

    let s3Files = [];
    let videoPath = [];
    if (req.files) {
      req.files.forEach((file) => {
        if (file) {
          const item = file.filename;
          const filePath = path.resolve(`uploads/${item}`);
          if (!(file.mimetype.split("video").length - 1)) {
            const resizedImages = resize(filePath, item);
            s3Files = s3Files.concat(resizedImages);
          } else {
            videoPath.push(filePath);
            const videoStream = fs.createReadStream(filePath);
            s3Files.push({
              Key: item,
              Body: videoStream,
              isOriginal: true,
            });
          }
        }
      });
    }
    if (videoPath && videoPath.length) {
      await Promise.all(
        videoPath.map(async (vPath) => {
          await generateScreenshot(vPath, 2);
          return;
        })
      );
    }

    try {
      await Promise.all(
        s3Files.map(async (file) => {
          await s3
            .upload({
              Key: file.Key,
              Body: file.Body,
              Bucket: `${appConfig.s3.bucket.name}/${appConfig.s3.bucket.profile}`,
              ACL: "public-read",
            })
            .promise();
          if (file.isOriginal) {
            await unlink(path.resolve(`uploads/${file.Key}`));
          }
          return;
        })
      );
    } catch (err) {
      return next(
        serializeHttpResponse(500, {
          message: "Something went wrong when uploading banner",
          error: err,
        })
      );
    }

    if (videoPath && videoPath.length) {
      try {
        await Promise.all(
          videoPath.map(async (vPath) => {
            const ssPath = `${vPath}_screenshot.png`;
            const resizedImages = resize(ssPath, req.files.video);

            await Promise.all(
              resizedImages.map((file) => {
                if (!file.isOriginal) {
                  return s3
                    .upload({
                      Key: file.Key,
                      Body: file.Body,
                      Bucket: `${appConfig.s3.bucket.name}/${appConfig.s3.bucket.profile}`,
                      ACL: "public-read",
                    })
                    .promise();
                }
                return;
              })
            );
            await unlink(ssPath);
          })
        );
      } catch (err) {
        return next(
          serializeHttpResponse(500, {
            message: "Something went wrong when uploading banner thumbnail",
            error: err,
          })
        );
      }
    }

    req.files = req.files.map((file) => file.filename);
    return next();
  });
};

exports.uploadVerificationDoc = (req, res, next) => {
  upload.fields([
    {
      name: "agencyDoc",
      maxCount: 10,
    },
    {
      name: "brandDoc",
      maxCount: 10,
    },
    {
      name: "verificationDoc",
      maxCount: 10,
    },
  ])(req, res, async (err) => {
    if (err) {
      return next(
        serializeHttpResponse(500, {
          message: "Server Error",
          error: err,
        })
      );
    }

    let s3Files = [];
    let videoPath = [];
    // req.files = req.files ? (req.files.brandDoc || []).concat(req.files.agencyDoc || []) : null;
    req.files = req.files ? req.files.verificationDoc : null;
    if (req.files && req.files.length) {
      req.files.forEach((file) => {
        if (file) {
          const item = file.filename;
          const filePath = path.resolve(`uploads/${item}`);
          if (!(file.mimetype.split("video").length - 1)) {
            const resizedImages = resize(filePath, item);
            s3Files = s3Files.concat(resizedImages);
          } else {
            videoPath.push(filePath);
            const videoStream = fs.createReadStream(filePath);
            s3Files.push({
              Key: item,
              Body: videoStream,
              isOriginal: true,
            });
          }
        }
      });
      if (videoPath && videoPath.length) {
        await Promise.all(
          videoPath.map(async (vPath) => {
            await generateScreenshot(vPath, 2);
            return;
          })
        );
      }

      try {
        await Promise.all(
          s3Files.map(async (file) => {
            await s3
              .upload({
                Key: file.Key,
                Body: file.Body,
                Bucket: `${appConfig.s3.bucket.name}/${appConfig.s3.bucket.profile}`,
                ACL: "public-read",
              })
              .promise();
            if (file.isOriginal) {
              await unlink(path.resolve(`uploads/${file.Key}`));
            }
            return;
          })
        );
      } catch (err) {
        return next(
          serializeHttpResponse(500, {
            message: "Something went wrong when uploading verification doc",
            error: err,
          })
        );
      }

      if (videoPath && videoPath.length) {
        try {
          await Promise.all(
            videoPath.map(async (vPath) => {
              const ssPath = `${vPath}_screenshot.png`;
              const resizedImages = resize(ssPath, req.files.video);

              await Promise.all(
                resizedImages.map((file) => {
                  if (!file.isOriginal) {
                    return s3
                      .upload({
                        Key: file.Key,
                        Body: file.Body,
                        Bucket: `${appConfig.s3.bucket.name}/${appConfig.s3.bucket.profile}`,
                        ACL: "public-read",
                      })
                      .promise();
                  }
                  return;
                })
              );
              await unlink(ssPath);
            })
          );
        } catch (err) {
          return next(
            serializeHttpResponse(500, {
              message:
                "Something went wrong when uploading verification doc thumbnail",
              error: err,
            })
          );
        }
      }

      req.files.brandDoc = req.files
        .filter((file) => file.fieldname === "brandDoc")
        .map((file) => file.filename);
      req.files.agencyDoc = req.files
        .filter((file) => file.fieldname === "agencyDoc")
        .map((file) => file.filename);
      req.files.verificationDoc = req.files
        .filter((file) => file.fieldname === "verificationDoc")
        .map((file) => file.filename);
    }

    return next();
  });
};

// exports.uploadBrandProductsMedia = (req, res, next) => {
//   // upload.array("media", 10)
//   upload.fields([
//     {
//       name: "media",
//       maxCount: 10,
//     },
//     {
//       name: "thumbnail",
//       maxCount: 10,
//     },
//   ])
//   (req, res, async (err) => {
//     if (err) {
//       return next(
//         serializeHttpResponse(500, {
//           message: "Server Error",
//           error: err,
//         })
//       );
//     }

//     try {
//       if (req.body.tags) {
//         req.body.tags = JSON.parse(req.body.tags);
//       }

//       // if (req.body.hashTag) {
//       //   req.body.hashTag = JSON.parse(req.body.hashTag);
//       // }
//     } catch (error) {
//       return next(
//         serializeHttpResponse(400, {
//           message: "Invalid Challenge List",
//           error: err,
//         })
//       );
//     }

//     const finalFiles = [];
//     let filesToUnlink = [];
//     let s3Files = [];
//     let videoPath = [];
//     console.log(req.files);
//     if (req.files) {
//       req.files.forEach((file) => {
//         if (file) {
//           const item = file.filename;
//           const filePath = path.resolve(`uploads/${item}`);
//           filesToUnlink.push(filePath);
//           if (!(file.mimetype.split("video").length - 1)) {
//             const resizedImages = resize(filePath, item);
//             s3Files = s3Files.concat(resizedImages);
//             finalFiles.push({
//               type: "image",
//               media: item,
//             });
//           } else {
//             videoPath.push(filePath);
//             const videoStream = fs.createReadStream(filePath);
//             s3Files.push({
//               Key: item,
//               Body: videoStream,
//               isOriginal: true,
//             });
//             finalFiles.push({
//               type: "video",
//               media: item,
//             });
//           }
//         }
//       });
//     }

//     if (videoPath && videoPath.length) {
//       await Promise.all(
//         videoPath.map(async (vPath) => {
//           const durationInSec = await getVideoDuration(vPath);
//           const splitDuration = durationInSec / 6;
//           await Promise.all(
//             [0, 1, 2, 3, 4].map(async (_item, index) => {
//               let suffix = index;
//               if (!index) {
//                 suffix = "";
//               }
//               await generateScreenshot(
//                 vPath,
//                 splitDuration * (index + 1),
//                 suffix
//               );
//               return;
//             })
//           );
//         })
//       );
//     }

//     try {
//       await Promise.all(
//         s3Files.map((file) => {
//           return s3
//             .upload({
//               Key: file.Key,
//               Body: file.Body,
//               Bucket: `${appConfig.s3.bucket.name}/${appConfig.s3.bucket.famelinks}`,
//               ACL: "public-read",
//             })
//             .promise();
//         })
//       );
//     } catch (err) {
//       return next(
//         serializeHttpResponse(500, {
//           message: "Something went wrong when uploading brand products",
//           error: err,
//         })
//       );
//     }

//     if (videoPath && videoPath.length) {
//       try {
//         await Promise.all(
//           videoPath.map(async (vPath) => {
//             const ssPath = `${vPath}_screenshot.png`;
//             const key = path.parse(vPath).name;
//             const resizedImages = resize(ssPath, key);

//             const otherScreenshots = [1, 2, 3, 4].map((item, index) => ({
//               Key: `${key}-${index + 1}`,
//               Body: fs.readFileSync(
//                 path.resolve(`${vPath}_screenshot${index + 1}.png`)
//               ),
//               isOriginal: false,
//             }));

//             await Promise.all(
//               resizedImages.concat(otherScreenshots).map((file) => {
//                 if (!file.isOriginal) {
//                   return s3
//                     .upload({
//                       Key: file.Key,
//                       Body: file.Body,
//                       Bucket: `${appConfig.s3.bucket.name}/${appConfig.s3.bucket.famelinks}`,
//                       ACL: "public-read",
//                     })
//                     .promise();
//                 }
//                 return;
//               })
//             );
//             await unlink(ssPath);
//             await Promise.all(
//               [1, 2, 3, 4].map((item, index) =>
//                 unlink(path.resolve(`${videoPath}_screenshot${index + 1}.png`))
//               )
//             );
//           })
//         );
//       } catch (err) {
//         return next(
//           serializeHttpResponse(500, {
//             message:
//               "Something went wrong when uploading brand products thumbnail",
//             error: err,
//           })
//         );
//       }
//     }

//     if (filesToUnlink.length) {
//       await Promise.all(filesToUnlink.map((file) => unlink(file)));
//     }
//     req.files = finalFiles;
//     return next();
//   });
// };

exports.uploadAvatar = (req, res, next) => {
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
  ])(req, res, async (err) => {
    if (err) {
      return serializeHttpResponse(500, {
        message: "Server Error",
        error: err,
      });
    }
    if (req.files && req.files.avatar && req.files.avatar[0]) {
      req.files.avatar = req.files.avatar[0].filename;
    }

    if (req.files && req.files.avatar) {
      const filePath = path.resolve(`uploads/${req.files.avatar}`);
      const resizedImages = resize(filePath, req.files.avatar);
      try {
        await Promise.all(
          resizedImages.map(async (file) => {
            await s3
              .upload({
                Key: file.Key,
                Body: file.Body,
                Bucket: `${appConfig.s3.bucket.name}/${appConfig.s3.bucket.avatar}`,
                ACL: "public-read",
              })
              .promise();
            if (file.isOriginal) {
              await unlink(path.resolve(`uploads/${file.Key}`));
            }
            return;
          })
        );
      } catch (err) {
        return next(
          serializeHttpResponse(500, {
            message: "Something went wrong when uploading avatar",
            error: err,
          })
        );
      }
    }
    return next();
  });
};

// exports.uploadGreetingVideo = (req, res, next) => {
//   upload.fields([
//     {
//       name: "greetVideo",
//       maxCount: 1,
//     },
//   ])(req, res, async (err) => {
//     if (err) {
//       return serializeHttpResponse(500, {
//         message: "Server Error",
//         error: err,
//       });
//     }
//     if (req.files) {
//       if (req.files.greetVideo && req.files.greetVideo[0]) {
//         req.files.greetVideo = req.files.greetVideo[0].filename;
//       }
//     }

//     if (req.files) {
//       const videoPath = path.resolve(`uploads/${req.files.greetVideo}`);
//       try {
//         const durationInSec = await getVideoDuration(videoPath);
//         const splitDuration = durationInSec / 6;
//         await Promise.all(
//           [0, 1, 2, 3, 4].map(async (_item, index) => {
//             let suffix = index;
//             if (!index) {
//               suffix = "";
//             }
//             await generateScreenshot(
//               videoPath,
//               splitDuration * (index + 1),
//               suffix
//             );
//             return;
//           })
//         );
//         const videoStream = fs.createReadStream(videoPath);
//         await s3
//           .upload({
//             Key: req.files.greetVideo,
//             Body: videoStream,
//             Bucket: `${appConfig.s3.bucket.name}/${appConfig.s3.bucket.joblinks}`,
//             ACL: "public-read",
//           })
//           .promise();

//         const ssPath = `${videoPath}_screenshot.png`;
//         const resizedImages = resize(ssPath, req.files.greetVideo);

//         const otherScreenshots = [1, 2, 3, 4].map((item, index) => ({
//           Key: `${req.files.greetVideo}-${index + 1}`,
//           Body: fs.readFileSync(
//             path.resolve(`${videoPath}_screenshot${index + 1}.png`)
//           ),
//           isOriginal: false,
//         }));

//         try {
//           await Promise.all(
//             resizedImages.concat(otherScreenshots).map((file) => {
//               if (!file.isOriginal) {
//                 return s3
//                   .upload({
//                     Key: file.Key,
//                     Body: file.Body,
//                     Bucket: `${appConfig.s3.bucket.name}/${appConfig.s3.bucket.joblinks}`,
//                     ACL: "public-read",
//                   })
//                   .promise();
//               }
//               return;
//             })
//           );
//           await unlink(videoPath);
//           await unlink(ssPath);
//           await Promise.all(
//             [1, 2, 3, 4].map((item, index) =>
//               unlink(path.resolve(`${videoPath}_screenshot${index + 1}.png`))
//             )
//           );
//         } catch (err) {
//           return next(
//             serializeHttpResponse(500, {
//               message: "Something went wrong when uploading funlink thumbnail",
//               error: err,
//             })
//           );
//         }
//       } catch (err) {
//         return next(
//           serializeHttpResponse(500, {
//             message: "Something went wrong when uploading funlinks video",
//             error: err,
//           })
//         );
//       }
//     }
//     return next();
//   });
// };
exports.uploadGreetingVideo = (req, res, next) => {
  upload.fields([
    {
      name: "greetVideo",
      maxCount: 1,
    },
    {
      name: "thumbnail",
      maxCount: 1,
    },
  ])(req, res, async (err) => {
    if (err) {
      return serializeHttpResponse(500, {
        message: "Server Error",
        error: err,
      });
    }

    if (req.files.greetVideo && req.files.greetVideo[0]) {
      let filename = req.files.greetVideo[0].filename;

      req.files.greetVideo = filename;
    }
    if (req.files.thumbnail && req.files.thumbnail[0]) {
      let filename = req.files.thumbnail[0].filename;

      req.files.thumbnail = filename;
    }

    if (req.files.greetVideo) {
      try {
        const videoPath = path.resolve(`uploads/${req.files.greetVideo}`);
        const videoStream = fs.createReadStream(videoPath);
        await s3
          .upload({
            Key: req.files.greetVideo,
            Body: videoStream,
            Bucket: `${appConfig.s3.bucket.name}/${appConfig.s3.bucket.joblinks}`,
            ACL: "public-read",
          })
          .promise();
        await unlink(videoPath);
      } catch (err) {
        return next(
          serializeHttpResponse(500, {
            message: "Something went wrong when uploading greet video",
            error: err,
          })
        );
      }

      if (req.files.thumbnail) {
        let thumbnailPath = path.resolve(`uploads/${req.files.thumbnail}`);
        try {
          let mediaStream = fs.createReadStream(thumbnailPath);
          await s3
            .upload({
              Key: req.files.greetVideo + "-xs",
              Body: mediaStream,
              Bucket: `${appConfig.s3.bucket.name}/${appConfig.s3.bucket.joblinks}`,
              ACL: "public-read",
            })
            .promise();
          await unlink(thumbnailPath);
          mediaStream = undefined;
          thumbnailPath = undefined;

          delete req.files.thumbnail;
        } catch (err) {
          return next(
            serializeHttpResponse(500, {
              message:
                "Something went wrong when uploading greet video thumbnail",
              error: err,
            })
          );
        }
      }
    }

    if (req.files && req.files.thumbnail) {
      delete req.files.thumbnail;
    }

    return next();
  });
};

exports.addJobCategory = (request, response, next) => {
  if (request.body.userType) {
    request.body.userType = JSON.parse(request.body.userType);
  }
  next();
};

exports.jobFaces = (request, response, next) => {
  try {
    if (request.body.height) {
      request.body.height = JSON.parse(request.body.height);
    }

    if (request.body.jobCategory) {
      request.body.jobCategory = JSON.parse(request.body.jobCategory);
    }
    if (request.body.ageGroup) {
      request.body.ageGroup = JSON.parse(request.body.ageGroup);
    }
  } catch (error) {
    return next(
      serializeHttpResponse(500, {
        message: "Something went wrong while creating jobs",
        error: error,
      })
    );
  }
  next();
};

exports.jobCrew = (request, response, next) => {
  try {
    if (request.body.jobCategory) {
      request.body.jobCategory = JSON.parse(request.body.jobCategory);
    }
  } catch (error) {
    return next(
      serializeHttpResponse(500, {
        message: "Something went wrong while creating jobs",
        error: error,
      })
    );
  }
  next();
};

exports.hireApplicant = (request, response, next) => {
  try {
    if (request.body.jobId) {
      request.body.jobId = JSON.parse(request.body.jobId);
    }

    if (request.body.userId) {
      request.body.userId = JSON.parse(request.body.userId);
    }
  } catch (error) {
    return next(
      serializeHttpResponse(500, {
        message: "Something went wrong while hiring applicant",
        error: error,
      })
    );
  }
  next();
};

exports.shortlistApplicant = (request, response, next) => {
  try {
    if (request.body.jobId) {
      request.body.jobId = JSON.parse(request.body.jobId);
    }

    if (request.body.userId) {
      request.body.userId = JSON.parse(request.body.userId);
    }
  } catch (error) {
    return next(
      serializeHttpResponse(500, {
        message: "Something went wrong while shortlisting applicant",
        error: error,
      })
    );
  }
  next();
};

exports.saveUnsaveTalent = (request, response, next) => {
  try {
    if (request.body.userId) {
      request.body.userId = JSON.parse(request.body.userId);
    }
  } catch (error) {
    return next(
      serializeHttpResponse(500, {
        message: "Something went wrong while saving/unsaving talent",
        error: error,
      })
    );
  }
  next();
};

exports.profileFaces = (request, response, next) => {
  try {
    if (request.body.height) {
      request.body.height = JSON.parse(request.body.height);
    }
    if (request.body.interestedLoc) {
      request.body.interestedLoc = JSON.parse(request.body.interestedLoc);
    }
    if (request.body.interestCat) {
      request.body.interestCat = JSON.parse(request.body.interestCat);
    }
  } catch (error) {
    return next(
      serializeHttpResponse(500, {
        message: "Something went wrong while saving/unsaving talent",
        error: error,
      })
    );
  }
  next();
};

exports.profileCrew = (request, response, next) => {
  try {
    if (request.body.interestedLoc) {
      request.body.interestedLoc = JSON.parse(request.body.interestedLoc);
    }
    if (request.body.interestCat) {
      request.body.interestCat = JSON.parse(request.body.interestCat);
    }
  } catch (error) {
    return next(
      serializeHttpResponse(500, {
        message: "Something went wrong while saving/unsaving talent",
        error: error,
      })
    );
  }
  next();
};

exports.addClub = (request, response, next) => {
  try {
    if (request.body.minRange) {
      request.body.minRange = parseInt(request.body.minRange);
    }
    if (request.body.maxRange) {
      request.body.maxRange = parseInt(request.body.maxRange);
    }
    if (request.body.minCost) {
      request.body.minCost = parseInt(request.body.minCost);
    }
    if (request.body.maxCost) {
      request.body.maxCost = parseInt(request.body.maxCost);
    }
  } catch (error) {
    return next(
      serializeHttpResponse(500, {
        message: "Something went wrong while adding new club",
        error: error,
      })
    );
  }
  next();
};


exports.uploadClubOfferMedia = (req, res, next) => {
  upload.array("media", 4)(req, res, async (err) => {
    if (err) {
      return next(
        serializeHttpResponse(500, {
          message: "Server Error",
          error: err,
        })
      );
    }

    try {
      if (req.body.category) {
        req.body.category = JSON.parse(req.body.category);
      }

      if (req.body.ageGroup) {
        req.body.ageGroup = JSON.parse(req.body.ageGroup);
      }

      if (req.body.location) {
        req.body.location = JSON.parse(req.body.location);
      }
    } catch (error) {
      return next(
        serializeHttpResponse(400, {
          message: "Error while upload club offers media",
          error: error,
        })
      );
    }

    const finalFiles = [];
    let filesToUnlink = [];
    let s3Files = [];
    let videoPath = [];
    let mediaStream;
    if (req.files) {
      req.files.forEach((file) => {
        if (file) {
          const item = file.filename;
          const filePath = path.resolve(`uploads/${item}`);
          filesToUnlink.push(filePath);
          if (!(file.mimetype.split("video").length - 1)) {
            finalFiles.push({
              type: "image",
              media: item,
            });
          } else {
            videoPath.push(filePath);
            finalFiles.push({
              type: "video",
              media: item,
            });
          }
          mediaStream = fs.createReadStream(filePath);
          s3Files.push({
            Key: item,
            Body: mediaStream,
          });
        }
      });
    }

    if (videoPath && videoPath.length) {
      await Promise.all(
        videoPath.map(async (vPath) => {
          const durationInSec = await getVideoDuration(vPath);
          const splitDuration = durationInSec / 6;
          await Promise.all(
            [0, 1, 2, 3, 4].map(async (_item, index) => {
              let suffix = index;
              if (!index) {
                suffix = "";
              }
              await generateScreenshot(
                vPath,
                splitDuration * (index + 1),
                suffix
              );
              return;
            })
          );
        })
      );
    }

    try {
      await Promise.all(
        s3Files.map((file) => {
          return s3
            .upload({
              Key: file.Key,
              Body: file.Body,
              Bucket: `${appConfig.s3.bucket.name}/${appConfig.s3.bucket.cluboffer}`,
              ACL: "public-read",
            })
            .promise();
        })
      );
    } catch (err) {
      return next(
        serializeHttpResponse(500, {
          message: "Something went wrong when uploading club offers media",
          error: err,
        })
      );
    }

    if (videoPath && videoPath.length) {
      try {
        await Promise.all(
          videoPath.map(async (vPath) => {
            const ssPath = `${vPath}_screenshot.png`;
            const key = path.parse(vPath).name;
            const resizedImages = resize(ssPath, key);

            const otherScreenshots = [1, 2, 3, 4].map((item, index) => ({
              Key: `${key}-${index + 1}`,
              Body: fs.readFileSync(
                path.resolve(`${vPath}_screenshot${index + 1}.png`)
              ),
              isOriginal: false,
            }));

            await Promise.all(
              resizedImages.concat(otherScreenshots).map((file) => {
                if (!file.isOriginal) {
                  return s3
                    .upload({
                      Key: file.Key,
                      Body: file.Body,
                      Bucket: `${appConfig.s3.bucket.name}/${appConfig.s3.bucket.cluboffer}`,
                      ACL: "public-read",
                    })
                    .promise();
                }
                return;
              })
            );
            await unlink(ssPath);
            await Promise.all(
              [1, 2, 3, 4].map((item, index) =>
                unlink(path.resolve(`${videoPath}_screenshot${index + 1}.png`))
              )
            );
          })
        );
      } catch (err) {
        return next(
          serializeHttpResponse(500, {
            message:
              "Something went wrong when uploading club offers media thumbnail",
            error: err,
          })
        );
      }
    }

    if (filesToUnlink.length) {
      await Promise.all(filesToUnlink.map((file) => unlink(file)));
    }
    req.body.media = finalFiles;
    return next();
  });
};

exports.uploadBrandProductsMedia = (req, res, next) => {
  upload.fields([
    {
      name: "media",
      maxCount: 10,
    },
    {
      name: "thumbnail",
      maxCount: 10,
    },
  ])(req, res, async (err) => {
    if (err) {
      return next(
        serializeHttpResponse(500, {
          message: "Server Error",
          error: err,
        })
      );
    }

    try {
      if (req.body.tags) {
        req.body.tags = JSON.parse(req.body.tags);
      }
    } catch (error) {
      return next(
        serializeHttpResponse(400, {
          message: "Invalid Challenge List",
          error: err,
        })
      );
    }

    const finalFiles = [];
    let filesToUnlink = [];
    let s3Files = [];
    let filePath;
    let mediaStream;
    if (req.files && req.files.media) {
      req.files.media.map(async (file, index) => {
        if (file) {
          const item = file.filename;
          filePath = path.resolve(`uploads/${item}`);
          filesToUnlink.push(filePath);
          console.log('mime type ::: ', file.mimetype);
          if (file.mimetype == "application/octet-stream") {
            finalFiles.push({
              type: "video",
              media: item,
            });
          } else if (!(file.mimetype.split("video").length - 1)) {
            finalFiles.push({
              type: "image",
              media: item,
            });
          } else {
            finalFiles.push({
              type: "video",
              media: item,
            });
          }
          mediaStream = fs.createReadStream(filePath);
          s3Files.push({
            Key: item,
            Body: mediaStream,
          });
          if (req.files.thumbnail) {
            if (req.files.thumbnail[index]) {
              filePath = path.resolve(
                `uploads/${req.files.thumbnail[index].filename}`
              );
              mediaStream = fs.createReadStream(filePath);
              s3Files.push({
                Key: item + "-xs",
                Body: mediaStream,
              });
            }
          }
          mediaStream = undefined;
          filePath = undefined;
        }
      });
    }

    try {
      await Promise.all(
        s3Files.map((file) => {
          return s3
            .upload({
              Key: file.Key,
              Body: file.Body,
              Bucket: `${appConfig.s3.bucket.name}/${appConfig.s3.bucket.famelinks}`,
              ACL: "public-read",
            })
            .promise();
        })
      );
    } catch (err) {
      return next(
        serializeHttpResponse(500, {
          message: "Something went wrong when uploading followlinks",
          error: err,
        })
      );
    }

    if (filesToUnlink && filesToUnlink.length) {
      await Promise.all(filesToUnlink.map((file) => unlink(file)));
    }
    req.files = finalFiles;
    return next();
  });
};




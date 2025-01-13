const S3 = require("aws-sdk/clients/s3");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const fsPromises = require("fs/promises");
const unlink = require("util").promisify(fs.unlink);
const uuid = require("uuid").v4;

const appConfig = require("../../configs/app.config");
const serializeHttpResponse = require("../helpers/serialize-http-response");
const { resize } = require("./sharp");
const { generateScreenshot, getVideoDuration } = require("./ffmpeg");

const { compressVideo, compressImage } = require("../utils/compress");

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
      name: "closeUp_tmb",
      maxCount: 1,
    },
    {
      name: "medium",
      maxCount: 1,
    },
    {
      name: "medium_tmb",
      maxCount: 1,
    },
    {
      name: "long",
      maxCount: 1,
    },
    {
      name: "long_tmb",
      maxCount: 1,
    },
    {
      name: "pose1",
      maxCount: 1,
    },
    {
      name: "pose1_tmb",
      maxCount: 1,
    },
    {
      name: "pose2",
      maxCount: 1,
    },
    {
      name: "pose2_tmb",
      maxCount: 1,
    },
    {
      name: "additional",
      maxCount: 1,
    },
    {
      name: "additional_tmb",
      maxCount: 1,
    },
    {
      name: "video",
      maxCount: 1,
    },
    {
      name: "video_tmb",
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
    let filePath;
    let mediaStream;

    //DO NOT UNCOMMENT
    // if (req.files) {
    //     await Promise.all(Object.keys(req.files).map(async (item) => {
    //         if (!item.includes('_tmb')) {
    //             if (req.files[item] && req.files[item][0]) {
    //                 if (item !== 'video') {
    //                     let filename = req.files[item][0].filename
    //                     if (req.files[item][0].size > appConfig.mediaLimit.image) {
    //                         const imagePath = path.resolve(`uploads/${req.files[item][0].filename}`)
    //                         try {
    //                             let result = await compressImage(imagePath, req.files[item][0].filename)
    //                             if (result) {
    //                                 let temp = path.resolve(`uploads/${req.files[item][0].filename}.jpg`)

    //                                 try {
    //                                     let result = await fsPromises.rename(temp, imagePath)
    //                                     console.log(result)
    //                                 }
    //                                 catch (error) {
    //                                     console.log(error)
    //                                     return next(serializeHttpResponse(200, {
    //                                         message: `Error while renaming compressed ${req.files[item][0].fieldname} image file`,
    //                                         error: err
    //                                     }))
    //                                 }

    //                                 req.files[item] = filename
    //                             }
    //                             else {
    //                                 await unlink(imagePath);
    //                                 return next(serializeHttpResponse(500, {
    //                                     message: `Failed to compress ${req.files[item][0].fieldname} image`
    //                                 }))
    //                             }
    //                         }
    //                         catch (error) {
    //                             console.log(error)
    //                             await unlink(imagePath);
    //                             return next(serializeHttpResponse(500, {
    //                                 message: `Error while compressing ${req.files[item][0].fieldname} image`,
    //                                 error: error.message
    //                             }))
    //                         }
    //                     } else {
    //                         req.files[item] = req.files[item][0].filename;
    //                     }
    //                     filePath = path.resolve(`uploads/${req.files[item]}`);
    //                     filesToUnlink.push(filePath);
    //                     mediaStream = fs.createReadStream(filePath);
    //                     s3Files.push({
    //                         Key: req.files[item],
    //                         Body: mediaStream
    //                     });
    //                     mediaStream = undefined
    //                     filePath = undefined

    //                     if (req.files[`${item}_tmb`] && req.files[`${item}_tmb`][0]) {
    //                         let filename = req.files[`${item}_tmb`][0].filename
    //                         if (req.files[`${item}_tmb`][0].size > appConfig.mediaLimit.thumbnail) {
    //                             const imagePath = path.resolve(`uploads/${req.files[`${item}_tmb`][0].filename}`)
    //                             try {
    //                                 let result = await compressImage(imagePath, req.files[`${item}_tmb`][0].filename)
    //                                 if (result) {
    //                                     let temp = path.resolve(`uploads/${req.files[`${item}_tmb`][0].filename}.jpg`)

    //                                     try {
    //                                         await fsPromises.rename(temp, imagePath)
    //                                     }
    //                                     catch (error) {
    //                                         console.log(error)
    //                                         return next(serializeHttpResponse(200, {
    //                                             message: `Error while renaming compressed ${item} thumbnail file`,
    //                                             error: err
    //                                         }))
    //                                     }

    //                                     req.files[`${item}_tmb`] = filename
    //                                 }
    //                                 else {
    //                                     await unlink(imagePath);
    //                                     return next(serializeHttpResponse(500, {
    //                                         message: `Failed to compress ${item} thumbnail`
    //                                     }))
    //                                 }
    //                             }
    //                             catch (error) {
    //                                 console.log(error)
    //                                 await unlink(imagePath);
    //                                 return next(serializeHttpResponse(500, {
    //                                     message: `Error while compressing ${item} thumbnail`,
    //                                     error: error.message
    //                                 }))
    //                             }
    //                         } else {
    //                             req.files[`${item}_tmb`] = req.files[`${item}_tmb`][0].filename;
    //                         }

    //                         filePath = path.resolve(`uploads/${req.files[`${item}_tmb`]}`);
    //                         filesToUnlink.push(filePath);
    //                         mediaStream = fs.createReadStream(filePath);
    //                         s3Files.push({
    //                             Key: req.files[`${item}_tmb`] + '-xs',
    //                             Body: mediaStream
    //                         });
    //                         mediaStream = undefined
    //                         filePath = undefined

    //                         delete req.files[`${item}_tmb`]
    //                     }
    //                 } else {
    //                     let filename = req.files.video[0].filename

    //                     if (req.files.video[0].size > appConfig.mediaLimit.video) {
    //                         const videoPath = path.resolve(`uploads/${req.files.video[0].filename}`)
    //                         try {
    //                             let result = await compressVideo(videoPath, req.files.video[0].filename, path.extname(req.files.video[0].originalname))
    //                             if (result) {
    //                                 let temp = path.resolve(`uploads/${req.files.video[0].filename}${path.extname(req.files.video[0].originalname)}`)

    //                                 try {
    //                                     await fsPromises.rename(temp, videoPath)
    //                                 }
    //                                 catch (error) {
    //                                     console.log(error)
    //                                     return next(serializeHttpResponse(200, {
    //                                         message: `Error while renaming compressed video file`,
    //                                         error: err
    //                                     }))
    //                                 }

    //                                 req.files.video = filename
    //                             }
    //                             else {
    //                                 await unlink(videoPath);
    //                                 return next(serializeHttpResponse(500, {
    //                                     message: 'Failed to compress video'
    //                                 }))
    //                             }
    //                         }
    //                         catch (error) {
    //                             await unlink(videoPath);
    //                             return next(serializeHttpResponse(500, {
    //                                 message: 'Error while compressing video',
    //                                 error: error.message
    //                             }))
    //                         }
    //                     } else {
    //                         req.files.video = req.files.video[0].filename;
    //                     }

    //                     filePath = path.resolve(`uploads/${req.files.video}`);
    //                     filesToUnlink.push(filePath);
    //                     mediaStream = fs.createReadStream(filePath);
    //                     s3Files.push({
    //                         Key: req.files.video,
    //                         Body: mediaStream
    //                     });
    //                     mediaStream = undefined
    //                     filePath = undefined

    //                     if (req.files.video_tmb) {
    //                         let filename = req.files.video_tmb[0].filename
    //                         if (req.files.video_tmb[0].size > appConfig.mediaLimit.thumbnail) {
    //                             const imagePath = path.resolve(`uploads/${req.files.video_tmb[0].filename}`)
    //                             try {
    //                                 let result = await compressImage(imagePath, req.files.video_tmb[0].filename)
    //                                 if (result) {
    //                                     let temp = path.resolve(`uploads/${req.files.video_tmb[0].filename}.jpg`)

    //                                     try {
    //                                         await fsPromises.rename(temp, imagePath)
    //                                     }
    //                                     catch (error) {
    //                                         console.log(error)
    //                                         return next(serializeHttpResponse(200, {
    //                                             message: `Error while renaming compressed video thumbnail file`,
    //                                             error: err
    //                                         }))
    //                                     }

    //                                     req.files.video_tmb = filename
    //                                 }
    //                                 else {
    //                                     await unlink(imagePath);
    //                                     return next(serializeHttpResponse(500, {
    //                                         message: 'Failed to compress video thumbnail'
    //                                     }))
    //                                 }
    //                             }
    //                             catch (error) {
    //                                 console.log(error)
    //                                 await unlink(imagePath);
    //                                 return next(serializeHttpResponse(500, {
    //                                     message: 'Error while compressing video thumbnail',
    //                                     error: error.message
    //                                 }))
    //                             }
    //                         } else {
    //                             req.files.video_tmb = req.files.video_tmb[0].filename;
    //                         }
    //                         filePath = path.resolve(`uploads/${req.files.video_tmb}`);
    //                         filesToUnlink.push(filePath);
    //                         mediaStream = fs.createReadStream(filePath);
    //                         s3Files.push({
    //                             Key: req.files.video + '-xs',
    //                             Body: mediaStream
    //                         });
    //                         mediaStream = undefined
    //                         filePath = undefined

    //                         delete req.files.video_tmb
    //                     }
    //                 }
    //             }
    //         }
    //     }))
    // }

    if (req.files) {
      if (req.files.closeUp) {
        let filename = req.files.closeUp[0].filename;
        // if (req.files.closeUp[0].size > appConfig.mediaLimit.image) {
        //   const imagePath = path.resolve(
        //     `uploads/${req.files.closeUp[0].filename}`
        //   );
        //   try {
        //     let result = await compressImage(
        //       imagePath,
        //       req.files.closeUp[0].filename
        //     );
        //     console.log(result);
        //     if (result) {
        //       let temp = path.resolve(
        //         `uploads/${req.files.closeUp[0].filename}.jpg`
        //       );
        //       try {
        //         await fsPromises.rename(temp, imagePath);
        //       } catch (error) {
        //         console.log(error);
        //         return next(
        //           serializeHttpResponse(200, {
        //             message:
        //               "Error while renaming compressed closeUp image file",
        //             error: err,
        //           })
        //         );
        //       }
        //       req.files.closeUp = filename;
        //     } else {
        //       await unlink(imagePath);
        //       return next(
        //         serializeHttpResponse(500, {
        //           message: "Failed to compress closeUp image",
        //         })
        //       );
        //     }
        //   } catch (error) {
        //     console.log(error);
        //     await unlink(imagePath);
        //     return next(
        //       serializeHttpResponse(500, {
        //         message: "Error while compressing closeUp image",
        //         error: error.message,
        //       })
        //     );
        //   }
        // } else {
        //   req.files.closeUp = req.files.closeUp[0].filename;
        // }
        req.files.closeUp = filename;
        filePath = path.resolve(`uploads/${req.files.closeUp}`);
        filesToUnlink.push(filePath);
        mediaStream = fs.createReadStream(filePath);
        s3Files.push({
          Key: req.files.closeUp,
          Body: mediaStream,
        });
        mediaStream = undefined;
        filePath = undefined;

        if (req.files.closeUp_tmb) {
          let filename = req.files.closeUp_tmb[0].filename;
          // if (req.files.closeUp_tmb[0].size > appConfig.mediaLimit.thumbnail) {
          //   const imagePath = path.resolve(
          //     `uploads/${req.files.closeUp_tmb[0].filename}`
          //   );
          //   try {
          //     let result = await compressImage(
          //       imagePath,
          //       req.files.closeUp_tmb[0].filename
          //     );
          //     if (result) {
          //       let temp = path.resolve(
          //         `uploads/${req.files.closeUp_tmb[0].filename}.jpg`
          //       );
          //       try {
          //         await fsPromises.rename(temp, imagePath);
          //       } catch (error) {
          //         console.log(error);
          //         return next(
          //           serializeHttpResponse(200, {
          //             message:
          //               "Error while renaming compressed closeUp thumbnail file",
          //             error: err,
          //           })
          //         );
          //       }
          //       req.files.closeUp_tmb = filename;
          //     } else {
          //       await unlink(imagePath);
          //       return next(
          //         serializeHttpResponse(500, {
          //           message: "Failed to compress closeUp thumbnail",
          //         })
          //       );
          //     }
          //   } catch (error) {
          //     console.log(error);
          //     await unlink(imagePath);
          //     return next(
          //       serializeHttpResponse(500, {
          //         message: "Error while compressing closeUp thumbnail",
          //         error: error.message,
          //       })
          //     );
          //   }
          // } else {
          //   req.files.closeUp_tmb = req.files.closeUp_tmb[0].filename;
          // }
          req.files.closeUp_tmb = filename;
          filePath = path.resolve(`uploads/${req.files.closeUp_tmb}`);
          filesToUnlink.push(filePath);
          mediaStream = fs.createReadStream(filePath);
          s3Files.push({
            Key: req.files.closeUp + "-xs",
            Body: mediaStream,
          });
          mediaStream = undefined;
          filePath = undefined;

          delete req.files.closeUp_tmb;
        }
      }
      if (req.files.medium) {
        let filename = req.files.medium[0].filename;
        // if (req.files.medium[0].size > appConfig.mediaLimit.image) {
        //   const imagePath = path.resolve(
        //     `uploads/${req.files.medium[0].filename}`
        //   );
        //   try {
        //     let result = await compressImage(
        //       imagePath,
        //       req.files.medium[0].filename
        //     );
        //     if (result) {
        //       let temp = path.resolve(
        //         `uploads/${req.files.medium[0].filename}.jpg`
        //       );
        //       try {
        //         await fsPromises.rename(temp, imagePath);
        //       } catch (error) {
        //         console.log(error);
        //         return next(
        //           serializeHttpResponse(200, {
        //             message:
        //               "Error while renaming compressed medium image file",
        //             error: err,
        //           })
        //         );
        //       }
        //       req.files.medium = filename;
        //     } else {
        //       await unlink(imagePath);
        //       return next(
        //         serializeHttpResponse(500, {
        //           message: "Failed to compress medium image",
        //         })
        //       );
        //     }
        //   } catch (error) {
        //     console.log(error);
        //     await unlink(imagePath);
        //     return next(
        //       serializeHttpResponse(500, {
        //         message: "Error while compressing medium image",
        //         error: error.message,
        //       })
        //     );
        //   }
        // } else {
        //   req.files.medium = req.files.medium[0].filename;
        // }
        req.files.medium = filename;
        filePath = path.resolve(`uploads/${req.files.medium}`);
        filesToUnlink.push(filePath);
        mediaStream = fs.createReadStream(filePath);
        s3Files.push({
          Key: req.files.medium,
          Body: mediaStream,
        });
        mediaStream = undefined;
        filePath = undefined;

        if (req.files.medium_tmb) {
          let filename = req.files.medium_tmb[0].filename;
          // if (req.files.medium_tmb[0].size > appConfig.mediaLimit.thumbnail) {
          //   const imagePath = path.resolve(
          //     `uploads/${req.files.medium_tmb[0].filename}`
          //   );
          //   try {
          //     let result = await compressImage(
          //       imagePath,
          //       req.files.medium_tmb[0].filename
          //     );
          //     if (result) {
          //       let temp = path.resolve(
          //         `uploads/${req.files.medium_tmb[0].filename}.jpg`
          //       );
          //       try {
          //         await fsPromises.rename(temp, imagePath);
          //       } catch (error) {
          //         console.log(error);
          //         return next(
          //           serializeHttpResponse(200, {
          //             message:
          //               "Error while renaming compressed medium thumbnail file",
          //             error: err,
          //           })
          //         );
          //       }
          //       req.files.medium_tmb = filename;
          //     } else {
          //       await unlink(imagePath);
          //       return next(
          //         serializeHttpResponse(500, {
          //           message: "Failed to compress medium thumbnail",
          //         })
          //       );
          //     }
          //   } catch (error) {
          //     console.log(error);
          //     await unlink(imagePath);
          //     return next(
          //       serializeHttpResponse(500, {
          //         message: "Error while compressing medium thumbnail",
          //         error: error.message,
          //       })
          //     );
          //   }
          // } else {
          //   req.files.medium_tmb = req.files.medium_tmb[0].filename;
          // }
          req.files.medium_tmb = filename;
          filePath = path.resolve(`uploads/${req.files.medium_tmb}`);
          filesToUnlink.push(filePath);
          mediaStream = fs.createReadStream(filePath);
          s3Files.push({
            Key: req.files.medium + "-xs",
            Body: mediaStream,
          });
          mediaStream = undefined;
          filePath = undefined;

          delete req.files.medium_tmb;
        }
      }
      if (req.files.long) {
        let filename = req.files.long[0].filename;
        // if (req.files.long[0].size > appConfig.mediaLimit.image) {
        //   const imagePath = path.resolve(
        //     `uploads/${req.files.long[0].filename}`
        //   );
        //   try {
        //     let result = await compressImage(
        //       imagePath,
        //       req.files.long[0].filename
        //     );
        //     if (result) {
        //       let temp = path.resolve(
        //         `uploads/${req.files.long[0].filename}.jpg`
        //       );
        //       try {
        //         await fsPromises.rename(temp, imagePath);
        //       } catch (error) {
        //         console.log(error);
        //         return next(
        //           serializeHttpResponse(200, {
        //             message: "Error while renaming compressed long image file",
        //             error: err,
        //           })
        //         );
        //       }
        //       req.files.long = filename;
        //     } else {
        //       await unlink(imagePath);
        //       return next(
        //         serializeHttpResponse(500, {
        //           message: "Failed to compress long image",
        //         })
        //       );
        //     }
        //   } catch (error) {
        //     console.log(error);
        //     await unlink(imagePath);
        //     return next(
        //       serializeHttpResponse(500, {
        //         message: "Error while compressing long image",
        //         error: error.message,
        //       })
        //     );
        //   }
        // } else {
        //   req.files.long = req.files.long[0].filename;
        // }
        req.files.long = filename;
        filePath = path.resolve(`uploads/${req.files.long}`);
        filesToUnlink.push(filePath);
        mediaStream = fs.createReadStream(filePath);
        s3Files.push({
          Key: req.files.long,
          Body: mediaStream,
        });
        mediaStream = undefined;
        filePath = undefined;

        if (req.files.long_tmb) {
          let filename = req.files.long_tmb[0].filename;
          // if (req.files.long_tmb[0].size > appConfig.mediaLimit.thumbnail) {
          //   const imagePath = path.resolve(
          //     `uploads/${req.files.long_tmb[0].filename}`
          //   );
          //   try {
          //     let result = await compressImage(
          //       imagePath,
          //       req.files.long_tmb[0].filename
          //     );
          //     if (result) {
          //       let temp = path.resolve(
          //         `uploads/${req.files.long_tmb[0].filename}.jpg`
          //       );
          //       try {
          //         await fsPromises.rename(temp, imagePath);
          //       } catch (error) {
          //         console.log(error);
          //         return next(
          //           serializeHttpResponse(200, {
          //             message:
          //               "Error while renaming compressed long thumbnail file",
          //             error: err,
          //           })
          //         );
          //       }
          //       req.files.long_tmb = filename;
          //     } else {
          //       await unlink(imagePath);
          //       return next(
          //         serializeHttpResponse(500, {
          //           message: "Failed to compress long thumbnail",
          //         })
          //       );
          //     }
          //   } catch (error) {
          //     console.log(error);
          //     await unlink(imagePath);
          //     return next(
          //       serializeHttpResponse(500, {
          //         message: "Error while compressing long thumbnail",
          //         error: error.message,
          //       })
          //     );
          //   }
          // } else {
          //   req.files.long_tmb = req.files.long_tmb[0].filename;
          // }
          req.files.long_tmb = filename;
          filePath = path.resolve(`uploads/${req.files.long_tmb}`);
          filesToUnlink.push(filePath);
          mediaStream = fs.createReadStream(filePath);
          s3Files.push({
            Key: req.files.long + "-xs",
            Body: mediaStream,
          });
          mediaStream = undefined;
          filePath = undefined;

          delete req.files.long_tmb;
        }
      }
      if (req.files.pose1) {
        let filename = req.files.pose1[0].filename;
        // if (req.files.pose1[0].size > appConfig.mediaLimit.image) {
        //   const imagePath = path.resolve(
        //     `uploads/${req.files.pose1[0].filename}`
        //   );
        //   try {
        //     let result = await compressImage(
        //       imagePath,
        //       req.files.pose1[0].filename
        //     );
        //     if (result) {
        //       let temp = path.resolve(
        //         `uploads/${req.files.pose1[0].filename}.jpg`
        //       );
        //       try {
        //         await fsPromises.rename(temp, imagePath);
        //       } catch (error) {
        //         console.log(error);
        //         return next(
        //           serializeHttpResponse(200, {
        //             message: "Error while renaming compressed pose1 image file",
        //             error: err,
        //           })
        //         );
        //       }
        //       req.files.pose1 = filename;
        //     } else {
        //       await unlink(imagePath);
        //       return next(
        //         serializeHttpResponse(500, {
        //           message: "Failed to compress pose1 image",
        //         })
        //       );
        //     }
        //   } catch (error) {
        //     console.log(error);
        //     await unlink(imagePath);
        //     return next(
        //       serializeHttpResponse(500, {
        //         message: "Error while compressing pose1 image",
        //         error: error.message,
        //       })
        //     );
        //   }
        // } else {
        //   req.files.pose1 = req.files.pose1[0].filename;
        // }
        req.files.pose1 = filename;
        filePath = path.resolve(`uploads/${req.files.pose1}`);
        filesToUnlink.push(filePath);
        mediaStream = fs.createReadStream(filePath);
        s3Files.push({
          Key: req.files.pose1,
          Body: mediaStream,
        });
        mediaStream = undefined;
        filePath = undefined;

        if (req.files.pose1_tmb) {
          let filename = req.files.pose1_tmb[0].filename;
          // if (req.files.pose1_tmb[0].size > appConfig.mediaLimit.thumbnail) {
          //   const imagePath = path.resolve(
          //     `uploads/${req.files.pose1_tmb[0].filename}`
          //   );
          //   try {
          //     let result = await compressImage(
          //       imagePath,
          //       req.files.pose1_tmb[0].filename
          //     );
          //     if (result) {
          //       let temp = path.resolve(
          //         `uploads/${req.files.pose1_tmb[0].filename}.jpg`
          //       );
          //       try {
          //         await fsPromises.rename(temp, imagePath);
          //       } catch (error) {
          //         console.log(error);
          //         return next(
          //           serializeHttpResponse(200, {
          //             message:
          //               "Error while renaming compressed pose1 thumbnail file",
          //             error: err,
          //           })
          //         );
          //       }
          //       req.files.pose1_tmb = filename;
          //     } else {
          //       await unlink(imagePath);
          //       return next(
          //         serializeHttpResponse(500, {
          //           message: "Failed to compress pose1 thumbnail",
          //         })
          //       );
          //     }
          //   } catch (error) {
          //     console.log(error);
          //     await unlink(imagePath);
          //     return next(
          //       serializeHttpResponse(500, {
          //         message: "Error while compressing pose1 thumbnail",
          //         error: error.message,
          //       })
          //     );
          //   }
          // } else {
          //   req.files.pose1_tmb = req.files.pose1_tmb[0].filename;
          // }
          req.files.pose1_tmb = filename;
          filePath = path.resolve(`uploads/${req.files.pose1_tmb}`);
          filesToUnlink.push(filePath);
          mediaStream = fs.createReadStream(filePath);
          s3Files.push({
            Key: req.files.pose1 + "-xs",
            Body: mediaStream,
          });
          mediaStream = undefined;
          filePath = undefined;

          delete req.files.pose1_tmb;
        }
      }
      if (req.files.pose2) {
        let filename = req.files.pose2[0].filename;
        // if (req.files.pose2[0].size > appConfig.mediaLimit.image) {
        //   const imagePath = path.resolve(
        //     `uploads/${req.files.pose2[0].filename}`
        //   );
        //   try {
        //     let result = await compressImage(
        //       imagePath,
        //       req.files.pose2[0].filename
        //     );
        //     if (result) {
        //       let temp = path.resolve(
        //         `uploads/${req.files.pose2[0].filename}.jpg`
        //       );
        //       try {
        //         await fsPromises.rename(temp, imagePath);
        //       } catch (error) {
        //         console.log(error);
        //         return next(
        //           serializeHttpResponse(200, {
        //             message: "Error while renaming compressed pose2 image file",
        //             error: err,
        //           })
        //         );
        //       }
        //       req.files.pose2 = filename;
        //     } else {
        //       await unlink(imagePath);
        //       return next(
        //         serializeHttpResponse(500, {
        //           message: "Failed to compress pose2 image",
        //         })
        //       );
        //     }
        //   } catch (error) {
        //     console.log(error);
        //     await unlink(imagePath);
        //     return next(
        //       serializeHttpResponse(500, {
        //         message: "Error while compressing pose2 image",
        //         error: error.message,
        //       })
        //     );
        //   }
        // } else {
        //   req.files.pose2 = req.files.pose2[0].filename;
        // }
        req.files.pose2 = filename;
        filePath = path.resolve(`uploads/${req.files.pose2}`);
        filesToUnlink.push(filePath);
        mediaStream = fs.createReadStream(filePath);
        s3Files.push({
          Key: req.files.pose2,
          Body: mediaStream,
        });
        mediaStream = undefined;
        filePath = undefined;

        if (req.files.pose2_tmb) {
          let filename = req.files.pose2_tmb[0].filename;
          // if (req.files.pose2_tmb[0].size > appConfig.mediaLimit.thumbnail) {
          //   const imagePath = path.resolve(
          //     `uploads/${req.files.pose2_tmb[0].filename}`
          //   );
          //   try {
          //     let result = await compressImage(
          //       imagePath,
          //       req.files.pose2_tmb[0].filename
          //     );
          //     if (result) {
          //       let temp = path.resolve(
          //         `uploads/${req.files.pose2_tmb[0].filename}.jpg`
          //       );
          //       try {
          //         await fsPromises.rename(temp, imagePath);
          //       } catch (error) {
          //         console.log(error);
          //         return next(
          //           serializeHttpResponse(200, {
          //             message:
          //               "Error while renaming compressed pose2 thumbnail file",
          //             error: err,
          //           })
          //         );
          //       }
          //       req.files.pose2_tmb = filename;
          //     } else {
          //       await unlink(imagePath);
          //       return next(
          //         serializeHttpResponse(500, {
          //           message: "Failed to compress pose2 thumbnail",
          //         })
          //       );
          //     }
          //   } catch (error) {
          //     console.log(error);
          //     await unlink(imagePath);
          //     return next(
          //       serializeHttpResponse(500, {
          //         message: "Error while compressing pose2 thumbnail",
          //         error: error.message,
          //       })
          //     );
          //   }
          // } else {
          //   req.files.pose2_tmb = req.files.pose2_tmb[0].filename;
          // }
          req.files.pose2_tmb = filename;
          filePath = path.resolve(`uploads/${req.files.pose2_tmb}`);
          filesToUnlink.push(filePath);
          mediaStream = fs.createReadStream(filePath);
          s3Files.push({
            Key: req.files.pose2 + "-xs",
            Body: mediaStream,
          });
          mediaStream = undefined;
          filePath = undefined;

          delete req.files.pose2_tmb;
        }
      }
      if (req.files.video) {
        let filename = req.files.video[0].filename;

        // if (req.files.video[0].size > appConfig.mediaLimit.video) {
        //   const videoPath = path.resolve(
        //     `uploads/${req.files.video[0].filename}`
        //   );
        //   try {
        //     let result = await compressVideo(
        //       videoPath,
        //       req.files.video[0].filename,
        //       path.extname(req.files.video[0].originalname)
        //     );
        //     if (result) {
        //       let temp = path.resolve(
        //         `uploads/${req.files.video[0].filename}${path.extname(
        //           req.files.video[0].originalname
        //         )}`
        //       );
        //       try {
        //         await fsPromises.rename(temp, imagePath);
        //       } catch (error) {
        //         console.log(error);
        //         return next(
        //           serializeHttpResponse(200, {
        //             message: "Error while renaming compressed video file",
        //             error: err,
        //           })
        //         );
        //       }
        //       req.files.video = filename;
        //     } else {
        //       await unlink(videoPath);
        //       return next(
        //         serializeHttpResponse(500, {
        //           message: "Failed to compress video",
        //         })
        //       );
        //     }
        //   } catch (error) {
        //     await unlink(videoPath);
        //     return next(
        //       serializeHttpResponse(500, {
        //         message: "Error while compressing video",
        //         error: error.message,
        //       })
        //     );
        //   }
        // } else {
        //   req.files.video = req.files.video[0].filename;
        // }

        req.files.video = filename;
        filePath = path.resolve(`uploads/${req.files.video}`);
        filesToUnlink.push(filePath);
        mediaStream = fs.createReadStream(filePath);
        s3Files.push({
          Key: req.files.video,
          Body: mediaStream,
        });
        mediaStream = undefined;
        filePath = undefined;

        if (req.files.video_tmb) {
          let filename = req.files.video_tmb[0].filename;
          // if (req.files.video_tmb[0].size > appConfig.mediaLimit.thumbnail) {
          //   const imagePath = path.resolve(
          //     `uploads/${req.files.video_tmb[0].filename}`
          //   );
          //   try {
          //     let result = await compressImage(
          //       imagePath,
          //       req.files.video_tmb[0].filename
          //     );
          //     if (result) {
          //       let temp = path.resolve(
          //         `uploads/${req.files.video_tmb[0].filename}.jpg`
          //       );
          //       try {
          //         await fsPromises.rename(temp, imagePath);
          //       } catch (error) {
          //         console.log(error);
          //         return next(
          //           serializeHttpResponse(200, {
          //             message:
          //               "Error while renaming compressed video thumbnail file",
          //             error: err,
          //           })
          //         );
          //       }
          //       req.files.video_tmb = filename;
          //     } else {
          //       await unlink(imagePath);
          //       return next(
          //         serializeHttpResponse(500, {
          //           message: "Failed to compress video thumbnail",
          //         })
          //       );
          //     }
          //   } catch (error) {
          //     console.log(error);
          //     await unlink(imagePath);
          //     return next(
          //       serializeHttpResponse(500, {
          //         message: "Error while compressing video thumbnail",
          //         error: error.message,
          //       })
          //     );
          //   }
          // } else {
          //   req.files.video_tmb = req.files.video_tmb[0].filename;
          // }
          req.files.video_tmb = filename;
          filePath = path.resolve(`uploads/${req.files.video_tmb}`);
          filesToUnlink.push(filePath);
          mediaStream = fs.createReadStream(filePath);
          s3Files.push({
            Key: req.files.video + "-xs",
            Body: mediaStream,
          });
          mediaStream = undefined;
          filePath = undefined;

          delete req.files.video_tmb;
        }
      }
      if (req.files.additional) {
        let filename = req.files.additional[0].filename;
        // if (req.files.additional[0].size > appConfig.mediaLimit.image) {
        //   const imagePath = path.resolve(
        //     `uploads/${req.files.additional[0].filename}`
        //   );
        //   try {
        //     let result = await compressImage(
        //       imagePath,
        //       req.files.additional[0].filename
        //     );
        //     if (result) {
        //       let temp = path.resolve(
        //         `uploads/${req.files.additional[0].filename}.jpg`
        //       );
        //       try {
        //         await fsPromises.rename(temp, imagePath);
        //       } catch (error) {
        //         console.log(error);
        //         return next(
        //           serializeHttpResponse(200, {
        //             message:
        //               "Error while renaming compressed additional image file",
        //             error: err,
        //           })
        //         );
        //       }
        //       req.files.additional = filename;
        //     } else {
        //       await unlink(imagePath);
        //       return next(
        //         serializeHttpResponse(500, {
        //           message: "Failed to compress additional image",
        //         })
        //       );
        //     }
        //   } catch (error) {
        //     console.log(error);
        //     await unlink(imagePath);
        //     return next(
        //       serializeHttpResponse(500, {
        //         message: "Error while compressing additional image",
        //         error: error.message,
        //       })
        //     );
        //   }
        // } else {
        //   req.files.additional = req.files.additional[0].filename;
        // }
        req.files.additional = filename;
        filePath = path.resolve(`uploads/${req.files.additional}`);
        filesToUnlink.push(filePath);
        mediaStream = fs.createReadStream(filePath);
        s3Files.push({
          Key: req.files.additional,
          Body: mediaStream,
        });
        mediaStream = undefined;
        filePath = undefined;

        if (req.files.additional_tmb) {
          let filename = req.files.additional_tmb[0].filename;
          // if (
          //   req.files.additional_tmb[0].size > appConfig.mediaLimit.thumbnail
          // ) {
          //   const imagePath = path.resolve(
          //     `uploads/${req.files.additional_tmb[0].filename}`
          //   );
          //   try {
          //     let result = await compressImage(
          //       imagePath,
          //       req.files.additional_tmb[0].filename
          //     );
          //     if (result) {
          //       let temp = path.resolve(
          //         `uploads/${req.files.additional_tmb[0].filename}.jpg`
          //       );
          //       try {
          //         await fsPromises.rename(temp, imagePath);
          //       } catch (error) {
          //         console.log(error);
          //         return next(
          //           serializeHttpResponse(200, {
          //             message:
          //               "Error while renaming compressed additional thumbnail file",
          //             error: err,
          //           })
          //         );
          //       }
          //       req.files.additional_tmb = filename;
          //     } else {
          //       await unlink(imagePath);
          //       return next(
          //         serializeHttpResponse(500, {
          //           message: "Failed to compress additional thumbnail",
          //         })
          //       );
          //     }
          //   } catch (error) {
          //     console.log(error);
          //     await unlink(imagePath);
          //     return next(
          //       serializeHttpResponse(500, {
          //         message: "Error while compressing additional thumbnail",
          //         error: error.message,
          //       })
          //     );
          //   }
          // } else {
          //   req.files.additional_tmb = req.files.additional_tmb[0].filename;
          // }
          req.files.additional_tmb = filename;
          filePath = path.resolve(`uploads/${req.files.additional_tmb}`);
          filesToUnlink.push(filePath);
          mediaStream = fs.createReadStream(filePath);
          s3Files.push({
            Key: req.files.additional + "-xs",
            Body: mediaStream,
          });
          mediaStream = undefined;
          filePath = undefined;
          delete req.files.additional_tmb;
        }
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
    if (filesToUnlink && filesToUnlink.length) {
      await Promise.all(filesToUnlink.map(async (file) => await unlink(file)));
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

    if (req.files.video && req.files.video[0]) {
      let filename = req.files.video[0].filename;
      // if (req.files.video[0].size > appConfig.mediaLimit.video) {
      //   const videoPath = path.resolve(
      //     `uploads/${req.files.video[0].filename}`
      //   );
      //   try {
      //     let result = await compressVideo(
      //       videoPath,
      //       req.files.video[0].filename,
      //       path.extname(req.files.video[0].originalname)
      //     );
      //     if (result) {
      //       let temp = path.resolve(
      //         `uploads/${req.files.video[0].filename}${path.extname(
      //           req.files.video[0].originalname
      //         )}`
      //       );
      //       try {
      //         await fsPromises.rename(temp, videoPath);
      //       } catch (error) {
      //         console.log(error);
      //         return next(
      //           serializeHttpResponse(200, {
      //             message: "Error while renaming compressed file",
      //             error: err,
      //           })
      //         );
      //       }
      //       req.files.video = filename;
      //     } else {
      //       await unlink(videoPath);
      //       return next(
      //         serializeHttpResponse(500, {
      //           message: "Failed to compress video",
      //         })
      //       );
      //     }
      //   } catch (error) {
      //     await unlink(videoPath);
      //     return next(
      //       serializeHttpResponse(500, {
      //         message: "Error while compressing video",
      //         error: error.message,
      //       })
      //     );
      //   }
      // } else {
      req.files.video = req.files.video[0].filename;
      // }
    }
    if (req.files.thumbnail && req.files.thumbnail[0]) {
      let filename = req.files.thumbnail[0].filename;
      // if (req.files.thumbnail[0].size > appConfig.mediaLimit.thumbnail) {
      //   const imagePath = path.resolve(
      //     `uploads/${req.files.thumbnail[0].filename}`
      //   );
      //   try {
      //     let result = await compressImage(
      //       imagePath,
      //       req.files.thumbnail[0].filename
      //     );
      //     if (result) {
      //       let temp = path.resolve(
      //         `uploads/${req.files.thumbnail[0].filename}.jpg`
      //       );
      //       try {
      //         await fsPromises.rename(temp, imagePath);
      //       } catch (error) {
      //         console.log(error);
      //         return next(
      //           serializeHttpResponse(200, {
      //             message: "Error while renaming compressed thumbnail file",
      //             error: err,
      //           })
      //         );
      //       }
      //       req.files.thumbnail = filename;
      //     } else {
      //       await unlink(imagePath);
      //       return next(
      //         serializeHttpResponse(500, {
      //           message: "Failed to compress thumbnail",
      //         })
      //       );
      //     }
      //   } catch (error) {
      //     await unlink(imagePath);
      //     return next(
      //       serializeHttpResponse(500, {
      //         message: "Error while compressing thumbnail",
      //         error: error.message,
      //       })
      //     );
      //   }
      // } else {

      req.files.thumbnail = req.files.thumbnail[0].filename;
      // }
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
      try {
        const videoPath = path.resolve(`uploads/${req.files.video}`);
        const videoStream = fs.createReadStream(videoPath);
        await s3
          .upload({
            Key: req.files.video,
            Body: videoStream,
            Bucket: `${appConfig.s3.bucket.name}/${appConfig.s3.bucket.funlinks}`,
            ACL: "public-read",
          })
          .promise();
        await unlink(videoPath);
      } catch (err) {
        return next(
          serializeHttpResponse(500, {
            message: "Something went wrong when uploading funlinks video",
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
              Key: req.files.video + "-xs",
              Body: mediaStream,
              Bucket: `${appConfig.s3.bucket.name}/${appConfig.s3.bucket.funlinks}`,
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
                "Something went wrong when uploading funlinks video thumbnail",
              error: err,
            })
          );
        }
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

    if (req.files && req.files.thumbnail) {
      delete req.files.thumbnail;
    }

    return next();
  });
};

exports.uploadFollowlinksMedia = (req, res, next) => {
  upload.fields([
    {
      name: "closeUp",
      maxCount: 1,
    },
    {
      name: "closeUp_tmb",
      maxCount: 1,
    },
    {
      name: "medium",
      maxCount: 1,
    },
    {
      name: "medium_tmb",
      maxCount: 1,
    },
    {
      name: "long",
      maxCount: 1,
    },
    {
      name: "long_tmb",
      maxCount: 1,
    },
    {
      name: "pose1",
      maxCount: 1,
    },
    {
      name: "pose1_tmb",
      maxCount: 1,
    },
    {
      name: "pose2",
      maxCount: 1,
    },
    {
      name: "pose2_tmb",
      maxCount: 1,
    },
    {
      name: "additional",
      maxCount: 1,
    },
    {
      name: "additional_tmb",
      maxCount: 1,
    },
    {
      name: "video",
      maxCount: 1,
    },
    {
      name: "video_tmb",
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
      if (req.body.challenges) {
        req.body.challenges = JSON.parse(req.body.challenges);
      }

      if (req.body.brandProductTags) {
        req.body.brandProductTags = JSON.parse(req.body.brandProductTags);
      }
      if (req.body.agencyTags) {
        req.body.agencyTags = JSON.parse(req.body.agencyTags);
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
    let filePath;
    let mediaStream;

    if (req.files) {
      if (req.files.closeUp) {
        let filename = req.files.closeUp[0].filename;
        req.files.closeUp = filename;
        filePath = path.resolve(`uploads/${req.files.closeUp}`);
        filesToUnlink.push(filePath);
        mediaStream = fs.createReadStream(filePath);
        s3Files.push({
          Key: req.files.closeUp,
          Body: mediaStream,
        });
        mediaStream = undefined;
        filePath = undefined;

        if (req.files.closeUp_tmb) {
          let filename = req.files.closeUp_tmb[0].filename;
          req.files.closeUp_tmb = filename;
          filePath = path.resolve(`uploads/${req.files.closeUp_tmb}`);
          filesToUnlink.push(filePath);
          mediaStream = fs.createReadStream(filePath);
          s3Files.push({
            Key: req.files.closeUp + "-xs",
            Body: mediaStream,
          });
          mediaStream = undefined;
          filePath = undefined;

          delete req.files.closeUp_tmb;
        }
      }
      if (req.files.medium) {
        let filename = req.files.medium[0].filename;
        req.files.medium = filename;
        filePath = path.resolve(`uploads/${req.files.medium}`);
        filesToUnlink.push(filePath);
        mediaStream = fs.createReadStream(filePath);
        s3Files.push({
          Key: req.files.medium,
          Body: mediaStream,
        });
        mediaStream = undefined;
        filePath = undefined;

        if (req.files.medium_tmb) {
          let filename = req.files.medium_tmb[0].filename;
          req.files.medium_tmb = filename;
          filePath = path.resolve(`uploads/${req.files.medium_tmb}`);
          filesToUnlink.push(filePath);
          mediaStream = fs.createReadStream(filePath);
          s3Files.push({
            Key: req.files.medium + "-xs",
            Body: mediaStream,
          });
          mediaStream = undefined;
          filePath = undefined;

          delete req.files.medium_tmb;
        }
      }
      if (req.files.long) {
        let filename = req.files.long[0].filename;
        req.files.long = filename;
        filePath = path.resolve(`uploads/${req.files.long}`);
        filesToUnlink.push(filePath);
        mediaStream = fs.createReadStream(filePath);
        s3Files.push({
          Key: req.files.long,
          Body: mediaStream,
        });
        mediaStream = undefined;
        filePath = undefined;

        if (req.files.long_tmb) {
          let filename = req.files.long_tmb[0].filename;
          req.files.long_tmb = filename;
          filePath = path.resolve(`uploads/${req.files.long_tmb}`);
          filesToUnlink.push(filePath);
          mediaStream = fs.createReadStream(filePath);
          s3Files.push({
            Key: req.files.long + "-xs",
            Body: mediaStream,
          });
          mediaStream = undefined;
          filePath = undefined;

          delete req.files.long_tmb;
        }
      }
      if (req.files.pose1) {
        let filename = req.files.pose1[0].filename;
        req.files.pose1 = filename;
        filePath = path.resolve(`uploads/${req.files.pose1}`);
        filesToUnlink.push(filePath);
        mediaStream = fs.createReadStream(filePath);
        s3Files.push({
          Key: req.files.pose1,
          Body: mediaStream,
        });
        mediaStream = undefined;
        filePath = undefined;

        if (req.files.pose1_tmb) {
          let filename = req.files.pose1_tmb[0].filename;
          req.files.pose1_tmb = filename;
          filePath = path.resolve(`uploads/${req.files.pose1_tmb}`);
          filesToUnlink.push(filePath);
          mediaStream = fs.createReadStream(filePath);
          s3Files.push({
            Key: req.files.pose1 + "-xs",
            Body: mediaStream,
          });
          mediaStream = undefined;
          filePath = undefined;

          delete req.files.pose1_tmb;
        }
      }
      if (req.files.pose2) {
        let filename = req.files.pose2[0].filename;
        req.files.pose2 = filename;
        filePath = path.resolve(`uploads/${req.files.pose2}`);
        filesToUnlink.push(filePath);
        mediaStream = fs.createReadStream(filePath);
        s3Files.push({
          Key: req.files.pose2,
          Body: mediaStream,
        });
        mediaStream = undefined;
        filePath = undefined;

        if (req.files.pose2_tmb) {
          let filename = req.files.pose2_tmb[0].filename;
          req.files.pose2_tmb = filename;
          filePath = path.resolve(`uploads/${req.files.pose2_tmb}`);
          filesToUnlink.push(filePath);
          mediaStream = fs.createReadStream(filePath);
          s3Files.push({
            Key: req.files.pose2 + "-xs",
            Body: mediaStream,
          });
          mediaStream = undefined;
          filePath = undefined;

          delete req.files.pose2_tmb;
        }
      }
      if (req.files.video) {
        let filename = req.files.video[0].filename;
        req.files.video = filename;
        filePath = path.resolve(`uploads/${req.files.video}`);
        filesToUnlink.push(filePath);
        mediaStream = fs.createReadStream(filePath);
        s3Files.push({
          Key: req.files.video,
          Body: mediaStream,
        });
        mediaStream = undefined;
        filePath = undefined;

        if (req.files.video_tmb) {
          let filename = req.files.video_tmb[0].filename;
          req.files.video_tmb = filename;
          filePath = path.resolve(`uploads/${req.files.video_tmb}`);
          filesToUnlink.push(filePath);
          mediaStream = fs.createReadStream(filePath);
          s3Files.push({
            Key: req.files.video + "-xs",
            Body: mediaStream,
          });
          mediaStream = undefined;
          filePath = undefined;

          delete req.files.video_tmb;
        }
      }
      if (req.files.additional) {
        let filename = req.files.additional[0].filename;
        req.files.additional = filename;
        filePath = path.resolve(`uploads/${req.files.additional}`);
        filesToUnlink.push(filePath);
        mediaStream = fs.createReadStream(filePath);
        s3Files.push({
          Key: req.files.additional,
          Body: mediaStream,
        });
        mediaStream = undefined;
        filePath = undefined;

        if (req.files.additional_tmb) {
          let filename = req.files.additional_tmb[0].filename;
          req.files.additional_tmb = filename;
          filePath = path.resolve(`uploads/${req.files.additional_tmb}`);
          filesToUnlink.push(filePath);
          mediaStream = fs.createReadStream(filePath);
          s3Files.push({
            Key: req.files.additional + "-xs",
            Body: mediaStream,
          });
          mediaStream = undefined;
          filePath = undefined;
          delete req.files.additional_tmb;
        }
      }
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
    if (filesToUnlink && filesToUnlink.length) {
      await Promise.all(filesToUnlink.map(async (file) => await unlink(file)));
    }
    return next();
  });
};

// exports.uploadFollowlinksMedia = (req, res, next) => {
//   upload.fields([
//     {
//       name: "media",
//       maxCount: 10,
//     },
//     {
//       name: "thumbnail",
//       maxCount: 10,
//     },
//   ])(req, res, async (err) => {
//     if (err) {
//       return next(
//         serializeHttpResponse(500, {
//           message: "Server Error",
//           error: err,
//         })
//       );
//     }

//     try {
//       if (req.body.challenges) {
//         req.body.challenges = JSON.parse(req.body.challenges);
//       }

//       if (req.body.brandProductTags) {
//         req.body.brandProductTags = JSON.parse(req.body.brandProductTags);
//       }
//       if (req.body.agencyTags) {
//         req.body.agencyTags = JSON.parse(req.body.agencyTags);
//       }
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
//     let filePath;
//     let mediaStream;
//     if (req.files && req.files.media) {
//       console.log(req.files.media);
//       req.files.media.map(async (file, index) => {
//         if (file) {
//           const item = file.filename;
//           filePath = path.resolve(`uploads/${item}`);
//           filesToUnlink.push(filePath);
//           if (!(file.mimetype.split("video").length - 1)) {
//             finalFiles.push({
//               type: "image",
//               media: item,
//             });
//           }else if (file.mimetype == "application/octet-stream") {
//             finalFiles.push({
//               type: "video",
//               media: item,
//             });
//           } else {
//             finalFiles.push({
//               type: "video",
//               media: item,
//             });
//           }
//           mediaStream = fs.createReadStream(filePath);
//           s3Files.push({
//             Key: item,
//             Body: mediaStream,
//           });
//           if (req.files.thumbnail) {
//             if (req.files.thumbnail[index]) {
//               filePath = path.resolve(
//                 `uploads/${req.files.thumbnail[index].filename}`
//               );
//               mediaStream = fs.createReadStream(filePath);
//               s3Files.push({
//                 Key: item + "-xs",
//                 Body: mediaStream,
//               });
//             }
//           }
//           mediaStream = undefined;
//           filePath = undefined;
//         }
//       });
//     }

//     try {
//       await Promise.all(
//         s3Files.map((file) => {
//           return s3
//             .upload({
//               Key: file.Key,
//               Body: file.Body,
//               Bucket: `${appConfig.s3.bucket.name}/${appConfig.s3.bucket.followlinks}`,
//               ACL: "public-read",
//             })
//             .promise();
//         })
//       );
//     } catch (err) {
//       return next(
//         serializeHttpResponse(500, {
//           message: "Something went wrong when uploading followlinks",
//           error: err,
//         })
//       );
//     }

//     if (filesToUnlink && filesToUnlink.length) {
//       await Promise.all(filesToUnlink.map((file) => unlink(file)));
//     }
//     req.files = finalFiles;
//     return next();
//   });
// };

exports.uploadCollablinksMedia = (req, res, next) => {
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
      if (req.body.agencyTags) {
        req.body.agencyTags = JSON.parse(req.body.agencyTags);
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
          if (!(file.mimetype.split("video").length - 1)) {
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
              Bucket: `${appConfig.s3.bucket.name}/${appConfig.s3.bucket.collablinks}`,
              ACL: "public-read",
            })
            .promise();
        })
      );
    } catch (err) {
      return next(
        serializeHttpResponse(500, {
          message: "Something went wrong when uploading collablinks",
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

exports.uploadChannelBanner = (req, res, next) => {
  const storage = multer.diskStorage({
    destination: appConfig.fileUploadPath,
    filename: (req, file, cb) => cb(null, `challenge_banner-${uuid()}`),
  });

  const upload = multer({ storage });

  upload.fields([
    {
      name: "challenge_banner",
      maxCount: 1,
    },
  ])(req, res, async (error) => {
    if (error) {
      return next(
        serializeHttpResponse(500, {
          message: "Something went wrong when uploading channel banner",
          error: error.message,
        })
      );
    }

    if (req.body.milestoneAggrement) {
      req.body.milestoneAggrement = JSON.parse(req.body.milestoneAggrement);
    }
    if (req.body.ageGroup) {
      req.body.ageGroup = JSON.parse(req.body.ageGroup);
    }

    if (req.body.trendzCategory) {
      req.body.trendzCategory = JSON.parse(req.body.trendzCategory);
    }

    try {
      if (req.files) {
        req.files.challenge_banner = req.files.challenge_banner[0].filename;
        const fileToUpload = path.resolve(
          `uploads/${req.files.challenge_banner}`
        );

        const fileStream = fs.createReadStream(fileToUpload);

        let result = undefined;
        result = await s3
          .upload({
            Key: req.files.challenge_banner,
            Body: fileStream,
            Bucket: appConfig.s3.bucket.trendz,
            ACL: "public-read",
          })
          .promise();

        if (result != undefined) {
          req.body.images = req.files.challenge_banner;
          return next();
        } else {
          return next(
            serializeHttpResponse(500, {
              message: "Failed to upload challenge banner",
            })
          );
        }
      }
      req.image_name = "";
      return next();
    } catch (error) {
      return next(
        serializeHttpResponse(500, {
          message: "Something went wrong when uploading channel banner",
          error: error.message,
        })
      );
    }
  });
};

exports.uploadRewardImages = (req, res, next) => {
  let result = undefined;
  let fileToUpload;
  let fileStream;

  const storage = multer.diskStorage({
    destination: appConfig.fileUploadPath,
    filename: (req, file, cb) => cb(null, `reward-${uuid()}`),
  });

  const upload = multer({ storage });

  upload.fields([
    {
      name: "rewardWinner",
      maxCount: 1,
    },
    {
      name: "rewardRunnerUp",
      maxCount: 1,
    },
  ])(req, res, async (error) => {
    if (error) {
      return next(
        serializeHttpResponse(500, {
          message: "Something went wrong when uploading channel banner",
          error: error.message,
        })
      );
    }

    if (req.body.rewardWinner) {
      console.log(req.body.rewardWinner);
      req.body.rewardWinner = JSON.parse(req.body.rewardWinner);
    }

    if (req.body.rewardRunnerUp) {
      req.body.rewardRunnerUp = JSON.parse(req.body.rewardRunnerUp);
    }

    try {
      if (req.files && req.files.length) {
        console.log(req.files);
        req.files.rewardWinner = req.files.rewardWinner[0].filename;

        fileToUpload = path.resolve(`uploads/${req.files.rewardWinner}`);

        fileStream = fs.createReadStream(fileToUpload);

        result = await s3
          .upload({
            Key: req.files.rewardWinner,
            Body: fileStream,
            Bucket: appConfig.s3.bucket.trendz,
            ACL: "public-read",
          })
          .promise();
        if (result != undefined) {
          req.body.rewardWinner.giftImage = req.files.rewardWinner;
        } else {
          return next(
            serializeHttpResponse(500, {
              message: "Failed to upload reward winner image",
            })
          );
        }

        req.files.rewardRunnerUp = req.files.rewardRunnerUp[0].filename;

        fileToUpload = path.resolve(`uploads/${req.files.rewardRunnerUp}`);

        fileStream = fs.createReadStream(fileToUpload);

        result = await s3
          .upload({
            Key: req.files.rewardRunnerUp,
            Body: fileStream,
            Bucket: appConfig.s3.bucket.trendz,
            ACL: "public-read",
          })
          .promise();

        if (result != undefined) {
          req.body.rewardRunnerUp.giftImage = req.files.rewardRunnerUp;
        } else {
          return next(
            serializeHttpResponse(500, {
              message: "Failed to upload reward runner-up image",
            })
          );
        }
        return next();
      }
    } catch (error) {
      return next(
        serializeHttpResponse(500, {
          message: "Something went wrong when uploading reward images",
          error: error.message,
        })
      );
    }
    return next();
  });
};
exports.uploadTrendzSuggestionMedia = (req, res, next) => {
  upload.array("images", 5)(req, res, async (err) => {
    if (err) {
      return next(
        serializeHttpResponse(500, {
          message: "Server Error",
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
            finalFiles.push(item);
          } else {
            videoPath.push(filePath);
            const videoStream = fs.createReadStream(filePath);
            s3Files.push({
              Key: item,
              Body: videoStream,
              isOriginal: true,
            });
            finalFiles.push(item);
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
              Bucket: `${appConfig.s3.bucket.name}/${appConfig.s3.bucket.challenges}`,
              ACL: "public-read",
            })
            .promise();
        })
      );
    } catch (err) {
      return next(
        serializeHttpResponse(500, {
          message: "Something went wrong when uploading media",
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
                      Bucket: `${appConfig.s3.bucket.name}/${appConfig.s3.bucket.challenges}`,
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
            message: "Something went wrong when uploading media thumbnail",
            error: err,
          })
        );
      }
    }

    if (filesToUnlink.length) {
      await Promise.all(filesToUnlink.map((file) => unlink(file)));
    }
    req.body.images = finalFiles;
    return next();
  });
};

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

exports.fameContest = (request, response, next) => {
  try {
    if (request.body.winnerRewards) {
      request.body.winnerRewards = JSON.parse(request.body.winnerRewards);
    }

    if (request.body.runnerUpRewards) {
      request.body.runnerUpRewards = JSON.parse(request.body.runnerUpRewards);
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

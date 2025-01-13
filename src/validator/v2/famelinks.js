const joi = require("joi").extend(require("@joi/date"));

module.exports = {
  famelinks: {
    payload: joi.object({
      challengeId: joi.array().items(joi.string().trim()).allow(null, ""),
      description: joi.string().trim().allow("", null),
      districtLevel: joi.boolean(),
      stateLevel: joi.boolean(),
      isWelcomeVideo: joi.boolean().optional(),
    }),
    files: joi
      .object()
      .keys({
        closeUp: joi.string().trim(),
        medium: joi.string().trim(),
        long: joi.string().trim(),
        pose1: joi.string().trim(),
        pose2: joi.string().trim(),
        additional: joi.string().trim(),
        video: joi.string().trim(),
      })
      .label("files")
      .min(1),
  },

  // funlink: {
  //     body: joi.object({
  //         description: joi.string().trim(),
  //         challengeId: joi.string().trim()
  //     }),
  //     files: joi.object({
  //         funlink: joi.string().trim().required()
  //     }).required()
  // },

  // getFollowLinks: {
  //     query: joi.object({
  //         page: joi.number().required()
  //     }).required()
  // },

  like: {
    params: joi.object({
      id: joi.string().trim().required(),
      type: joi.string().valid("comment", "media").required(),
    }),
    payload: joi.object({
      status: joi.number().valid(0, 1, 2, null, 3).required(),
    }),
  },

  addComment: {
    params: joi.object({
      mediaId: joi.string().trim().required(),
    }),
    payload: joi.object({
      parentId: joi.string().trim().allow(null),
      body: joi.string().trim().required(),
    }),
  },

  deleteComment: {
    params: joi.object({
      commentId: joi.string().trim().required(),
    }),
  },

  getComments: {
    params: joi.object({
      mediaId: joi.string().trim().required(),
    }),
    query: joi.object({
      page: joi.number().min(1).required(),
    }),
  },

  getCommentReplies: {
    params: joi.object({
      commentId: joi.string().trim().required(),
    }),
    query: joi.object({
      page: joi.number().min(1).required(),
    }),
  },

  updateComment: {
    params: joi.object({
      commentId: joi.string().trim().required(),
    }),
    payload: joi.object({
      body: joi.string().trim().required(),
    }),
  },
  
  share: {
    params: joi.object({
      type: joi.string().required(),
      mediaId: joi.string().trim().required(),
    }),
  },

  contentViewed: {
    params: joi.object({
      type: joi.string().required(),
      mediaId: joi.string().trim().required(),
    }),
  },

  getFamelinks: {
    query: joi.object({
      page: joi.number().min(1).required(),
      famelinksfirstDate: joi.date().utc().allow("", null),
      famelinks: joi.string().trim().allow("", null, "next", "prev"),
      famelinkslastDate: joi.date().utc().allow("", null),
      postId: joi.string(),
    }),
  },

  getAdFamelinks: {
    query: joi.object({
      page: joi.number().min(1).required(),
    }),
  },

  // getFunlinks: {
  //     query: joi.object({
  //         page: joi.number().required()
  //     })
  // },

  getMyFamelinks: {
    query: joi.object({
      page: joi.number().min(1).required(),
    }),
  },

  getUserFamelinks: {
    params: joi.object({
      userId: joi.string().required(),
    }),
    query: joi.object({
      page: joi.number().min(1).required(),
      postId: joi.string(),
      hashTagId: joi.string(),
    }),
  },

  deletePost: {
    params: joi.object({
      postId: joi.string().trim().required(),
    }),
  },

  deletePostMedia: {
    params: joi.object({
      postId: joi.string().trim().required(),
      mediaType: joi
        .string()
        .trim()
        .valid(
          "closeUp",
          "medium",
          "pose1",
          "pose2",
          "additional",
          "long",
          "video"
        )
        .required(),
    }),
  },

  updatePost: {
    params: joi.object({
      postId: joi.string().trim().required(),
    }),
    payload: joi.object().keys({
      description: joi.string().trim().required(),
    }),
  },

  markSafe: {
    params: joi.object({
      postId: joi.string().trim().required(),
    }),
    payload: joi.object().keys({
      isSafe: joi.boolean().default(null),
    }),
  },

  getSingleFamelinks: {
    params: joi.object({
      postId: joi.string().required(),
    }),
  },


  // getMyFunlinks: {
  //     query: joi.object({
  //         page: joi.number().required()
  //     })
  // },

  // getMyChallenges: {
  //     query: joi.object({
  //         page: joi.number().required()
  //     })
  // }
};

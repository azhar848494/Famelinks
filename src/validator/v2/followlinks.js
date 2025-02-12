const joi = require("joi").extend(require("@joi/date"));

module.exports = {
  followlinks: {
    payload: joi.object({
      challenges: joi.array().items(joi.string().trim()),
      description: joi.string().trim().allow("", null),
      channelId: joi.string().trim().allow("", null),
      brandProductTags: joi.array().items(joi.string().trim()),
      agencyTags: joi.array().items(joi.string().trim()),
      isWelcomeVideo: joi.boolean(),
      offerCode: joi.string().trim(),
      productId: joi.string().trim(),
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

  getFollowlinks: {
    query: joi.object({
      page: joi.number().min(1).required(),
      followlinksfirstDate: joi.date().utc().allow("", null),
      followlinkslastDate: joi.date().utc().allow("", null),
      followlinks: joi.string().trim().allow("", null, "next", "prev"),
      postId: joi.string(),
    }),
  },

  // getFunlinks: {
  //     query: joi.object({
  //         page: joi.number().required()
  //     })
  // },

  getMyFollowlinks: {
    query: joi.object({
      page: joi.number().min(1).required(),
    }),
  },

  getUserFollowlinks: {
    params: joi.object({
      userId: joi.string().required(),
    }),
    query: joi.object({
      page: joi.number().min(1).required(),
      postId: joi.string(),
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
      mediaName: joi.string().trim().required(),
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

  getSingleFollowlinks: {
    params: joi.object({
      postId: joi.string().required(),
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

  view: {
    params: joi.object({
      mediaId: joi.string().trim().required(),
    }),
  },
};

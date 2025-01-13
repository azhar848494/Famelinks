const joi = require('joi');

module.exports = {
  followlinks: {
    payload: joi.object({
      challenges: joi.array().items(joi.string().trim()),
      description: joi.string().trim().allow("", null),
      tags: joi.array().items(joi.string().trim()),
      isWelcomeVideo: joi.boolean(),
      channelId: joi.string().trim(),
      offerCode: joi.string().trim(),
    }),
    files: joi
      .array()
      .items(
        joi.object().keys({
          type: joi.string().valid("image", "video"),
          media: joi.string().required(),
        })
      )
      .label("media")
      .min(1)
      .required(),
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

  getWelcomeVideo: {
    query: joi.object({
      page: joi.number().min(1).required(),
    }),
  },
};
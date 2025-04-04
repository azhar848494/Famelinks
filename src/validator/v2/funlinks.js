const joi = require("joi").extend(require("@joi/date"));

module.exports = {
  funlink: {
    payload: joi.object({
      description: joi.string().trim(),
      challenges: joi.array().items(joi.string().trim()),
      musicName: joi.string().trim(),
      musicId: joi.string().trim(),
      tags: joi.array().items(joi.string().trim()),
      talentCategory: joi.array().items(joi.string().trim()),
      isWelcomeVideo: joi.boolean(),
    }),
    files: joi
      .object({
        video: joi.string().trim().required(),
        audio: joi.string().trim(),
      })
      .required(),
  },

  getFollowLinks: {
    query: joi
      .object({
        page: joi.number().required(),
      })
      .required(),
  },

  getFunlinks: {
    query: joi.object({
      page: joi.number().min(1).required(),
      funlinkslastDate: joi.date().utc().allow("", null),
      funlinksfirstDate: joi.date().utc().allow("", null),
      funlinks: joi.string().trim().allow("", null, "next", "prev"),
      postId: joi.string(),
    }),
  },

  getMyFunlinks: {
    query: joi.object({
      page: joi.number().min(1).required(),
    }),
  },

  getUserFunlinks: {
    params: joi.object({
      userId: joi.string().required(),
    }),
    query: joi.object({
      page: joi.number().min(1).required(),
      postId: joi.string(),
      hashTagId: joi.string(),
      musicId: joi.string(),
    }),
  },

  getMyChallenges: {
    query: joi.object({
      page: joi.number().required(),
    }),
  },

  like: {
    params: joi.object({
      id: joi.string().trim().required(),
      type: joi.string().valid("comment", "media").required(),
    }),
    payload: joi.object({
      status: joi.number().valid(0, 2, null, 3).required(),
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

  deletePost: {
    params: joi.object({
      postId: joi.string().trim().required(),
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

  getMusic: {
    query: joi.object({
      page: joi.number().min(1).required(),
      search: joi.string().trim(),
      type: joi
        .string()
        .valid("trending", "voice", "songs", "saved")
        .default("trending"),
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

  getSingleFamelinks: {
    params: joi.object({
      postId: joi.string().required(),
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

  getMusicPosts: {
    params: joi.object({
      musicId: joi.string().required(),
    }),
    query: joi.object({
      page: joi.number().positive().required(),
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

  view: {
    params: joi.object({
      mediaId: joi.string().trim().required(),
    }),
  },
};

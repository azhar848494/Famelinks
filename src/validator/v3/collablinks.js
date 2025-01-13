const joi = require("joi");

module.exports = {
  collablinks: {
    payload: joi.object({
      description: joi.string().trim().allow("", null),
      agencyTags: joi.array().items(joi.string().trim()),
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

  getUserCollablinks: {
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
  deleteComment: {
    params: joi.object({
      commentId: joi.string().trim().required(),
    }),
  },
};

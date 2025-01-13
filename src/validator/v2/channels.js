const joi = require('joi');

module.exports = {
  channel: {
    payload: joi.object({
      name: joi.string().trim().required(),
    }),
  },

  followUnfollow: {
    params: joi.object({
      channelId: joi.string().trim().required(),
    }),
  },

  searchChannel: joi.object({
    query: joi.object({
      page: joi.number().min(1).required(),
    }),
    params: joi.object({
      data: joi.string().trim().required(),
    }),
  }),
  getChannelPosts: {
      query: joi.object({
          page: joi.number().min(1).required()
      })
  },
};
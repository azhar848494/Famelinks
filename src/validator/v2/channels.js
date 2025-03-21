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

  getChannelGrid: {
    params: joi.object().keys({
      channelId: joi.string().trim().required(),
    }),
    query: joi.object().keys({
      page: joi.number().min(1).required(),
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

  getPopularChannel: joi.object({
    query: joi.object({
      page: joi.number().min(1).required(),
      search: joi.string().trim(),
    }),
  }),
  
  getChannelPosts: {
      query: joi.object({
          page: joi.number().min(1).required()
      })
  },
};
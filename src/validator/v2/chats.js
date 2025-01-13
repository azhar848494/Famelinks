const joi = require('joi');

module.exports = {
  getUserChats: {
    query: joi.object({
      page: joi.number().min(1).required(),
    }),
  },
  getUserChatsRequest: {
    query: joi.object({
      page: joi.number().min(1).required(),
    }),
  },
  getUserMessages: {
    // params: joi.object({
    //   chatId: joi.string().trim().required(),
    // }),
    query: joi.object({
      userId: joi.string().trim().required(),
      page: joi.number().min(1).required(),
      category: joi.string().trim().required().valid("conversation", "jobChat")
    }),
  },
  acceptIgnoreRequest: {
    payload: joi.object({
      accept: joi.boolean().required(),
    }),
  },
  markAsRead: {
    params: joi.object({
      chatId: joi.string().trim().required(),
    }),
  },
  getUserJobChats: {
    query: joi.object({
      page: joi.number().min(1).required(),
    }),
  },
  getUserJobChatsRequest: {
    query: joi.object({
      page: joi.number().min(1).required(),
    }),
  },
};
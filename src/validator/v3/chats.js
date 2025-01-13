const joi = require('joi');

module.exports = {
    getUserChats: {
        query: joi.object({
            page: joi.number().min(1).required()
        })
    },
    getUserChatsRequest: {
        query: joi.object({
            page: joi.number().min(1).required()
        })
    },
    getUserMessages: {
        params: joi.object({
            chatId: joi.string().trim().required()
        }),
        query: joi.object({
            page: joi.number().min(1).required()
        })
    },
    acceptIgnoreRequest: {
        payload: joi.object({
            accept: joi.boolean().required()
        })
    },
    markAsRead: {
        params: joi.object({
            chatId: joi.string().trim().required()
        })
    },
    closeChat: {
        params: joi.object({
            chatId: joi.string().trim().required()
        })
    }
};
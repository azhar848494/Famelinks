const joi = require('joi').extend(require("@joi/date"));

module.exports = {
    getFamelinks: {
        query: joi.object({
            page: joi.number().min(1).required(),
            famelinksDate: joi.date().utc().allow('', null),
            famelinks: joi.string().trim().allow('', null, 'next', 'prev')
        })
    },

    getStatus: {
        payload: joi.object({
            postIds: joi.array().items(joi.string().trim()).min(1).max(10)
        })
    },

    getUser: {
        payload: joi.object({
            id: joi.string().trim(),
        })
    }
}
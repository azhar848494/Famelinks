const joi = require('joi')

module.exports = {
    addClub: {
        body: joi.object({
            name: joi.string().trim().required(),
            minRange: joi.number().min(0).required(),
            maxRange: joi.number().required(),
            minCost: joi.number().min(0).required(),
            maxCost: joi.number().required(),
            type: joi.string().trim().valid('followlinks', 'funlinks').required()
        })
    }
}
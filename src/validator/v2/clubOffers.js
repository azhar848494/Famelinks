const joi = require('joi').extend(require("@joi/date"));

module.exports = {
    clubOffer: {
        payload: joi.object({
            title: joi.string().required(),
            club: joi.string().trim().valid('Bud', 'Rising', 'Known', 'Celebrity', 'Star', 'Superstar').required(),
            type: joi.string().trim().valid('followlinks', 'funlinks').required(),
            startDate: joi.date().format("DD-MM-YYYY").utc().optional(),
            startTime: joi.string().optional(),
            requiredMilestone: joi.number().min(1).required(),
            days: joi.number().min(1).required(),
            category: joi.array().items(joi.string().trim().required()),
            location: joi.string().trim().required(),
            ageGroup: joi.array().items(joi.string().trim().required()),
            gender: joi.string().trim().required(),
            message: joi.string().trim().allow('', null),
            cost: joi.number().min(0).allow(0),
            media: joi
                .array()
                .items(
                    joi.object().keys({
                        type: joi.string().valid("image", "video"),
                        media: joi.string().required(),
                    })
                )
                .label("media")
                .max(4),   
            paymentId: joi.string().required(),
        }),
    },

    getClubOfferById: {
        params: joi.object({
            offerId: joi.string().trim().required()
        })
    },

    getClubOffer: {
        payload: joi.object({
            category: joi.string().trim().required(),
        }),
        query: joi.object({
            page: joi.number().optional().default(1),
            search: joi.string().trim(),
        })
    },

    saveUnsavePromoters: {
        params: joi.object({
            offerId: joi.string().trim().required()
        }),
        payload: joi.object({
            profileId: joi.string().trim().required(),
            action: joi.string().trim().valid('save', 'unsave').required()
        })
    },

    applyWithdrawPromoters: {
        params: joi.object({
            offerId: joi.string().trim().required()
        }),
        payload: joi.object({
            action: joi.string().trim().valid('apply', 'withdraw').required()
        })
    },

    withdrawCancelOffers: {
        params: joi.object({
            offerId: joi.string().trim().required()
        }),
        payload: joi.object({
            action: joi.string().trim().valid('withdraw', 'cancel').required()
        })
    },

    category: {
        payload: joi.object({
            name: joi.string().trim().disallow('', null).required()
        })
    },

    grantOffer: {
        payload: joi.object({
            profileId: joi.string().trim().disallow('', null).required(),
            offerId: joi.string().trim().disallow('', null).required()
        })
    },

    updateClubOffer: {
        params: joi.object({
            offerId: joi.string().trim().required()
        }),
        payload: joi.object({
            offer: joi.string().trim().valid('posting').optional(),
            club: joi.string().trim().valid('Bud', 'Rising', 'Known', 'Celebrity', 'Star', 'Superstar').required(),
            type: joi.string().trim().valid('followlinks', 'funlinks').required(),
            startDate: joi.date().optional(),
            requiredMilestone: joi.number().min(1).optional(),
            days: joi.number().min(1).optional(),
            category: joi.array().items(joi.string().trim().optional()).allow('', null),
            location: joi.array().items(joi.string().trim()).required(),
            ageGroup: joi.array().items(joi.string().trim().optional()),
            gender: joi.string().trim().valid("male", "female", "all").optional(),
            message: joi.string().trim().allow('', null),
            cost: joi.number().min(0).allow(0),
            media: joi
                .array()
                .items(
                    joi.object().keys({
                        type: joi.string().valid("image", "video"),
                        media: joi.string().required(),
                    })
                )
                .label("media")
                .max(4)
        }),
    },

    searchData: {
        params: joi.object({
            searchData: joi.string().trim().required().disallow('', null)
        }),
        query: joi.object({
            page: joi.number().min(1).required()
        })
    },

    getApplicants: {
        params: joi.object({
            offerId: joi.string().trim().required()
        })
    }
}


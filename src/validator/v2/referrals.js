const joi = require('joi');

module.exports = {
    applyReferralCode: {
        payload: joi.object({
            referralCode: joi.string().trim().required()
        })
    }
};
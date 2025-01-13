const serializeHttpResponse = require('../../../helpers/serialize-http-response')
const createClubOffer = require('../../../services/v2/clubOffers/createClubOffer')
const getSettingService = require("../../../services/v2/users/getSetting");

module.exports = async (request) => {
    let payload = request.body
    payload.gender = JSON.parse(payload.gender);

    if (request.body.type == 'followlinks') {
        payload.createdBy = request.user._id
    }

    if (request.body.type == 'funlinks') {
        payload.createdBy = request.user._id
    }

    if (request.body.category && request.body.category.length > 3) {
        return serializeHttpResponse(400, {
            message: 'Maximum 3 club categories can be selected'
          })
    }

    let setting = await getSettingService('other');

    payload.influencerCost = Math.round(payload.cost - (payload.cost * setting.platformCost));

    let result = await createClubOffer(payload)

    if (!result) {
        return serializeHttpResponse(500, {
            message: 'Failed to create club offer',
        })
    }

    //Match with users' clubCategory(in profilefollowlinks) and send notifications to those users

    return serializeHttpResponse(200, {
        message: 'Club offer created successfuly',
        result
    })
}
const serializeHttpResponse = require('../../../helpers/serialize-http-response')
const saveUnsavePromoters = require('../../../services/v2/clubOffers/saveUnsavePromoters')
const { isValidObjectId } = require("../../../utils/db");

module.exports = async (request) => {
    let action = request.body.action
    let profileId = request.body.profileId
    let offerId = request.params.offerId

    if (!isValidObjectId(profileId)) {
        return serializeHttpResponse(400, {
            message: 'Invalid profile Id'
        });
    }

    if (!isValidObjectId(offerId)) {
        return serializeHttpResponse(400, {
            message: 'Invalid offer Id'
        });
    }

    let result = await saveUnsavePromoters(profileId, offerId, action)

    if (!result) {
        let message = (action == 'save') ? 'Failed to save the promoter' : 'Failed to unsave the promoter'
        return serializeHttpResponse(500, {
            message,
        });
    }

    let message = (action == 'save') ? 'Promoter saved successfuly' : 'Promoter unsaved successfuly'
    return serializeHttpResponse(200, {
        message,
        result
    });
}

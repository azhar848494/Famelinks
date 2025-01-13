const serializeHttpResponse = require('../../../helpers/serialize-http-response')
const { isValidObjectId } = require("../../../utils/db");
const getClubOfferById = require('../../../services/v2/clubOffers/getClubOfferById')

module.exports = async (request) => {
    let offerId = request.params.offerId

    if (!isValidObjectId(offerId)) {
        return serializeHttpResponse(400, {
            message: 'Invalid Club Offer Id'
        });
    }

    let result = await getClubOfferById(offerId)

    if (!result) {
        return serializeHttpResponse(500, {
            message: 'Failed to fetch club offer'
        })
    }

    return serializeHttpResponse(200, {
        message: 'Club offer fetched successfuly',
        result
    })
}
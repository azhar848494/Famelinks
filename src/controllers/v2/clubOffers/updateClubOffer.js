const serializeHttpResponse = require('../../../helpers/serialize-http-response')
const { isValidObjectId } = require("../../../utils/db");
const updateClubOffer = require('../../../services/v2/clubOffers/updateClubOffer')

module.exports = async (request) => {
    let offerId = request.params.offerId

    if (!isValidObjectId(offerId)) {
        return serializeHttpResponse(400, {
            message: 'Invalid Club Offer Id'
        });
    }

    if (request.body.category && request.body.category.length > 3) {
        return serializeHttpResponse(400, {
            message: 'Maximum 3 club categories can be selected'
          })
    }

    let result = await updateClubOffer(offerId, request.body)

    if (!result) {
        return serializeHttpResponse(500, {
            message: 'Failed to update club offer'
        })
    }

    return serializeHttpResponse(200, {
        message: 'Club offer updated successfuly',
        result
    })
}



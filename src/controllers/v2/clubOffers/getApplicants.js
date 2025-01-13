const serializeHttpResponse = require('../../../helpers/serialize-http-response')
const getApplicants = require('../../../services/v2/clubOffers/getApplicants')
const { isValidObjectId } = require("../../../utils/db");

module.exports = async (request) => {
    let offerId = request.params.offerId

    if (!isValidObjectId(offerId)) {
        return serializeHttpResponse(400, {
            message: 'Invalid Club Offer Id'
        });
    }

    let result = await getApplicants(offerId)

    if (result && result.length == 0) {
        return serializeHttpResponse(500, {
            message: 'Failed to fetch club offer applicants',
            result
        })
    }

    return serializeHttpResponse(200, {
        message: 'Applicants fetched successfuly',
        result
    })
}
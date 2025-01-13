const serializeHttpResponse = require('../../../helpers/serialize-http-response');
const getHiringProfile = require('../../../services/v2/joblinks/getHiringProfile')

module.exports = async (request, profileType) => {
    if (request.user.type == 'brand') {
        return serializeHttpResponse(400, {
            message: 'Brand does not have hiring profile',
        })
    }

    if (request.user.type == 'agency' && profileType == 'faces') {
        return serializeHttpResponse(400, {
            message: 'Agency does not have front facing jobs hiring profile',
        })
    }

    let result = await getHiringProfile(request.user._id, profileType)

    if (!result) {
        return serializeHttpResponse(500, {
            message: 'Failed to fetch hiring profile',
            result
        })
    }

    return serializeHttpResponse(200, {
        message: 'Hiring profile fetched',
        result
    })
}

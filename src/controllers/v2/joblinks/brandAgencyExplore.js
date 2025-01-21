const serializeHttpResponse = require('../../../helpers/serialize-http-response');
const brandAgencyExplore = require('../../../services/v2/joblinks/brandAgencyExplore')

module.exports = async (request) => {
    const userId = request.user._id
    const search = request.query.search || ""
    const page = request.query.page || 1

    const result = await brandAgencyExplore({ userId, search, page })

    if (!result) {
        return serializeHttpResponse(500, {
            message: 'Failed to fetch profiles and jobs',
        })
    }

    return serializeHttpResponse(200, {
        message: 'success',
        result
    })
}
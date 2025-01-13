const serializeHttpResponse = require('../../../helpers/serialize-http-response');
const userExploreService = require('../../../services/v2/joblinks/userExplore')

module.exports = async (request) => {
    let page = request.query.page
    let joblinksId = request.user._id

    let result

    result = await userExploreService(page, joblinksId, request.user._id)

    if (result && result.length == 0) {
        return serializeHttpResponse(500, {
            message: 'No jobs found',
        })
    }

    return serializeHttpResponse(200, {
        message: 'success',
        result
    })
}
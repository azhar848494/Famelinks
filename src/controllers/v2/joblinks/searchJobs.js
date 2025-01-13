const serializeHttpResponse = require('../../../helpers/serialize-http-response');
const searchJobs = require('../../../services/v2/joblinks/searchJobs')

module.exports = async (request) => {
    let title = request.params.title
    let page = request.query.page
    let selfJoblinksId = request.user._id

    let result = await searchJobs(selfJoblinksId, title, page)

    if (result && result.length == 0) {
        return serializeHttpResponse(500, {
            message: 'Failed to fetch job`'
        })
    }

    return serializeHttpResponse(200, {
        message: 'Job fetched successfuly',
        result
    })
}

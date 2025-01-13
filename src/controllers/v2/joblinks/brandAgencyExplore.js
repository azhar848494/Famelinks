const serializeHttpResponse = require('../../../helpers/serialize-http-response');
const brandAgencyExplore = require('../../../services/v2/joblinks/brandAgencyExplore')

module.exports = async (request) => {
    let search = request.query.search
    search = search ? search : "";
    let page = request.query.page
    let joblinksId = request.user._id

    let result

    result = await brandAgencyExplore(search, page, joblinksId)

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
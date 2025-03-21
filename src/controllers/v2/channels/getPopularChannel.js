const serializeHttpResponse = require('../../../helpers/serialize-http-response')
const getPopularChannel = require('../../../services/v2/channels/getPopularChannel')

module.exports = async (request) => {
    let page = request.query.page
    let search = request.query.search

    let result = await getPopularChannel(request.user._id, search, page)

    return serializeHttpResponse(200, {
        message: 'Channel fetched',
        result
    })
}
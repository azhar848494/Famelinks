const serializeHttpResponse = require('../../../helpers/serialize-http-response')
const searchChannel = require('../../../services/v2/channels/searchChannel')

module.exports = async (request) => {
    let data = request.params.data
    let page = request.query.page

    let result = await searchChannel(request.user._id, data, page)

    return serializeHttpResponse(200, {
        message: 'Channel fetched',
        result
    })
}
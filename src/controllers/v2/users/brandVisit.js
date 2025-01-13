const serializeHttpResponse = require('../../../helpers/serialize-http-response')
const brandVisitService = require('../../../services/v2/users/brandVisit')

module.exports = async (request) => {
    let result = await brandVisitService(request.user._id, request.params.type, request.params.brandId)

    return serializeHttpResponse(200, {
        message: 'Brand visit successful',
        result
    })
}
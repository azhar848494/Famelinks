const serializeHttpResponse = require('../../../helpers/serialize-http-response');
const exploreFollowlinks = require('../../../services/v2/challenges/exploreFollowlinks')

module.exports = async (request) => {
    let page = request.query.page
    //MasterIdMigration
    let result = await exploreFollowlinks(request.user._id, request.user._id, request.user._id, request.user.type, page)
    return serializeHttpResponse(200, {
        message: 'Followlinks fetched',
        result
    })
}
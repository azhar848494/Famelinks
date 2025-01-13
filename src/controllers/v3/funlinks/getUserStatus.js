const serializeHttpResponse = require('../../../helpers/serialize-http-response')
const getStatusService = require('../../../services/v3/funlinks/getStatus')
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId

module.exports = async (request) => {
    let postIds = request.body.postIds
    let masterUserId = request.user._id
    let profileId = request.user.profileFunlinks

    postIds = postIds.map((postId) => ObjectId(postId))

    let result = await getStatusService(postIds, profileId, masterUserId)

    return serializeHttpResponse(200, {
        message: 'Famelinks status fetched successfuly',
        result
    })
}
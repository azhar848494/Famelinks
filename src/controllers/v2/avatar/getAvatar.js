const serializeHttpResponse = require('../../../helpers/serialize-http-response');
const getAvatarService = require('../../../services/v2/avatar/getAvatar')

module.exports = async (request) => {
    let result = await getAvatarService()
    return serializeHttpResponse(200, {
        message: 'Avatars fetched',
        result
    })
}
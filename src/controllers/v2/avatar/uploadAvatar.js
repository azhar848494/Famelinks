const serializeHttpResponse = require('../../../helpers/serialize-http-response');
const uploadAvatarService = require('../../../services/v2/avatar/uploadAvatar')

module.exports = async (request) => {
    let result = await uploadAvatarService(request.files.avatar)
    return serializeHttpResponse(200, {
        message: 'Avatar uploaded',
    })
}
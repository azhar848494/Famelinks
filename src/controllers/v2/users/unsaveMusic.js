const serializeHttpResponse = require('../../../helpers/serialize-http-response');
const unsaveMusicService = require('../../../services/v2/users/unsaveMusic');
const { isValidObjectId } = require('../../../utils/db');

module.exports = async (request) => {
    if (!isValidObjectId(request.params.musicId)) {
        return serializeHttpResponse(400, {
            message: 'Invalid Object Id'
        });
    }

    await unsaveMusicService(request.user._id, request.params.musicId);

    return serializeHttpResponse(200, {
        message: 'Unsaved',
    });
};
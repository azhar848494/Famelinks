const serializeHttpResponse = require('../../../helpers/serialize-http-response');
const getSingleFameLinksService = require('../../../services/v2/famelinks/getSingleFameLinks');
const { isValidObjectId } = require('../../../utils/db');

module.exports = async (request) => {
    if (!isValidObjectId(request.params.postId)) {
        return serializeHttpResponse(400, {
            message: 'Invalid Object Id'
        });
    }

    const result = await getSingleFameLinksService(request.user._id, request.user._id, request.params.postId);
    if (!result) {
        return serializeHttpResponse(200, {
            message: 'FameLinks not found',
            result
        });
    }

    return serializeHttpResponse(200, {
        message: 'FameLinks Fetched',
        result
    });
};
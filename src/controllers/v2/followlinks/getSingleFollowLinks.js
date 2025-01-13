const serializeHttpResponse = require('../../../helpers/serialize-http-response');
const getSingleFollowLinksService = require('../../../services/v2/followlinks/getSingleFollowLinks');
const { isValidObjectId } = require('../../../utils/db');

module.exports = async (request) => {
    if (!isValidObjectId(request.params.postId)) {
        return serializeHttpResponse(400, {
            message: 'Invalid Object Id'
        });
    }

    const result = await getSingleFollowLinksService(request.user._id, request.user._id, request.params.postId);
    if (!result) {
        return serializeHttpResponse(200, {
            message: 'FollowLinks not found',
            result
        });
    }

    return serializeHttpResponse(200, {
        message: 'FollowLinks Fetched',
        result
    });
};
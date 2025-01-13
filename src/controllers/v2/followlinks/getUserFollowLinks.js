const serializeHttpResponse = require('../../../helpers/serialize-http-response');
const getMyFollowLinksService = require('../../../services/v2/followlinks/getMyFollowLinks');
const { isValidObjectId } = require('../../../utils/db');

module.exports = async (request) => {
    let postId = request.query.postId;
    postId = postId ? postId : "*";

    if (!isValidObjectId(request.params.userId)) {
        return serializeHttpResponse(400, {
            message: 'Invalid Object Id'
        });
    }
    
    const result = await getMyFollowLinksService(
        request.params.userId,
        request.query.page,
        request.user._id,
        request.user._id,
        postId
    );

    return serializeHttpResponse(200, {
        message: 'FollowLinks Fetched',
        result
    });
};
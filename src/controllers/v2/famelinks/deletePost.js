const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const deletePostService = require("../../../services/v2/famelinks/deletePost");
const getOnePostService = require('../../../services/v2/famelinks/getOnePost');
const { isValidObjectId } = require("../../../utils/db");


module.exports = async (request) => {
    if (!isValidObjectId(request.params.postId)) {
        return serializeHttpResponse(400, {
            message: 'Invalid Object Id'
        });
    }

    const onePost = await getOnePostService(request.params.postId);
    if (!onePost) {
        return serializeHttpResponse(200, {
            message: 'Post not found'
        });
    }

    if (onePost.userId.toString() !== request.user._id.toString()) {
        return serializeHttpResponse(403, {
            message: 'Permission Denied'
        });
    }
    
    await deletePostService(request.params.postId, request.user._id, onePost.challengeId);
    return serializeHttpResponse(200, {
        message: 'Post Deleted',
    });
    //---------------------------------v2------------------------------------//
};
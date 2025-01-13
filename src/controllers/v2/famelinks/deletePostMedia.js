const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const deletePostMediaService = require("../../../services/v2/famelinks/deletePostMedia");
const getOnePostService = require('../../../services/v2/famelinks/getOnePost');
const { isValidObjectId } = require("../../../utils/db");
const deletePostService = require("../../../services/v2/famelinks/deletePost");

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
    if (onePost.userId.toString() != request.user._id.toString()) {
        return serializeHttpResponse(403, {
            message: 'Permission Denied'
        });
    }
    await deletePostMediaService(request.params.postId, request.user._id, request.params.mediaType);
    const mediaList = [onePost.closeUp, onePost.medium, onePost.long, onePost.pose1, onePost.pose2, onePost.additional, onePost.video];
    const filteredMediaList = mediaList.filter(item => item);
    if (filteredMediaList.length <= 1) {
        await deletePostService(request.params.postId, request.user._id);
    }
    return serializeHttpResponse(200, {
        message: 'Post Deleted',
    });
    //---------------------------------v2------------------------------------//
};
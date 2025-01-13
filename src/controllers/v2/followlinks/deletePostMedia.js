const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const deletePostMediaService = require("../../../services/v2/followlinks/deletePostMedia");
const getOnePostService = require('../../../services/v2/followlinks/getOnePost');
const { isValidObjectId } = require("../../../utils/db");
const deletePostService = require("../../../services/v2/followlinks/deletePost");

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

    await deletePostMediaService(request.params.postId, request.user._id, request.params.mediaName);

    const filteredMediaList = onePost.media.filter(item => item);

    if (filteredMediaList.length <= 1) {
        await deletePostService(request.params.postId, request.user._id);
    }
    return serializeHttpResponse(200, {
        message: 'Post Deleted',
    });
    //-------------------------v2--------------------------//
};
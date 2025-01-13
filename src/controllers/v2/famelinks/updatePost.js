const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const updatePostService = require("../../../services/v2/famelinks/updatePost");
const getOnePostService = require('../../../services/v2/famelinks/getOnePost');
const { isValidObjectId } = require("../../../utils/db");

module.exports = async (request) => {
    if (!isValidObjectId(request.params.postId)) {
        return serializeHttpResponse(400, {
            message: 'Invalid Object Id'
        });
    }

    const onePost = await getOnePostService(request.params.postId);

    if (onePost.userId.toString() !== request.user._id.toString()) {
        return serializeHttpResponse(403, {
            message: 'Permission Denied'
        });
    }

    await updatePostService(request.params.postId, request.body);
    return serializeHttpResponse(200, {
        message: 'Famelinks Updated'
    });
};
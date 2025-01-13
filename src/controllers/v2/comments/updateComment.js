const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const updateCommentService = require("../../../services/v2/comments/updateComment");
const getUserCommentByIdService = require('../../../services/v2/comments/getUserCommentById');
const { isValidObjectId } = require("../../../utils/db");

module.exports = async (request, postType) => {
    let linkType = postType

    if (!isValidObjectId(request.params.commentId)) {
        return serializeHttpResponse(400, {
            message: 'Invalid Object Id'
        });
    }

    if (postType === "famelinks" && request.user.type !== "individual") {
        switch (request.user.type) {
            case "brand":
                linkType = "storelinks";
                break;
            case "agency":
                linkType = "collablinks";
                break;
            default:
                break;
        }
    }

    const onePost = await getUserCommentByIdService(request.params.commentId, request.user._id);
    if (!onePost) {
        return serializeHttpResponse(200, {
            message: 'Comment not found'
        });
    }
    await updateCommentService(request.params.commentId, request.body.body, request.user._id);
    return serializeHttpResponse(200, {
        message: 'Comment Updated',
    });
};
const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const deleteCommentService = require("../../../services/v2/comments/deleteComment");
const getOneComment = require('../../../services/v2/comments/getOneComment');
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

    if (postType === "collablinks") {
        linkType = "followlinks";
    }

    const oneComment = await getOneComment(request.params.commentId);
    
    if (!oneComment) {
        return serializeHttpResponse(400, {
            message: 'Comment not found'
        });
    }
    
    if (oneComment.userId.toString() !== request.user._id.toString()) {
        return serializeHttpResponse(403, {
            message: 'Permission Denied'
        });
    }

    await deleteCommentService(request.params.commentId, request.user._id, oneComment.mediaId, postType);

    return serializeHttpResponse(200, {
        message: 'Comment Deleted',
    });
};
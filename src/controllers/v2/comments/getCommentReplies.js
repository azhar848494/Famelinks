const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const getCommentRepliesService = require("../../../services/v2/comments/getCommentReplies");
const getOneCommentService = require('../../../services/v2/comments/getOneComment');
const { isValidObjectId } = require("../../../utils/db");

module.exports = async (request, postType) => {
    let linkType = postType

    if (!isValidObjectId(request.params.commentId)) {
        return serializeHttpResponse(400, {
            message: 'Invalid Object Id'
        });
    }

    const oneComment = await getOneCommentService(request.params.commentId);
    if (!oneComment) {
        return serializeHttpResponse(200, {
            message: 'Comment not found'
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

    const result = await getCommentRepliesService(request.user._id, request.params.commentId, request.query.page, postType);
    return serializeHttpResponse(200, {
        message: 'Replies Fetched',
        result: {
            data: result,
            count: oneComment.repliesCount
        }
    });
};
const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const getCommentsService = require("../../../services/v2/comments/getComments");
const { isValidObjectId } = require("../../../utils/db");

module.exports = async (request, postType) => {
    let linkType = postType

    if (!isValidObjectId(request.params.mediaId)) {
        return serializeHttpResponse(400, {
            message: 'Invalid Object Id'
        });
    }

    const getOnePostService = require(`../../../services/v2/${postType}/getOnePost`);

    const onePost = await getOnePostService(request.params.mediaId);
    if (!onePost) {
        return serializeHttpResponse(200, {
            message: 'Post not found'
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

    const result = await getCommentsService(request.user._id, request.params.mediaId, request.query.page, postType);
    return serializeHttpResponse(200, {
        message: 'Comments Fetched',
        result: {
            data: result,
            count: onePost.commentsCount
        }
    });
};
const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const updatePostService = require("../../../services/v3/collablinks.js/updatePost");
const getOnePostService = require("../../../services/v2/collablinks/getOnePost");
const { isValidObjectId } = require("../../../utils/db");

//---------------------------------v2------------------------------------//
const getCollablinksProfile = require("../../../services/v2/users/getChildProfile");
//---------------------------------v2------------------------------------//

module.exports = async (request) => {
  if (!isValidObjectId(request.params.postId)) {
    return serializeHttpResponse(400, {
      message: "Invalid Object Id",
    });
  }

  //---------------------------------v2------------------------------------//
  const onePost = await getOnePostService(request.params.postId);
  if (!onePost) {
    return serializeHttpResponse(200, {
      message: "Post not found",
    });
  }

  let collabLinksProfile = await getCollablinksProfile(
    request.user._id,
    "collablinks",
    "self"
  );

  if (onePost.userId.toString() !== collabLinksProfile[0]._id.toString()) {
    return serializeHttpResponse(403, {
      message: "Permission Denied",
    });
  }
  await updatePostService(request.params.postId, request.body);
  return serializeHttpResponse(200, {
    message: "Post Updated",
  });
  //---------------------------------v2------------------------------------//
};

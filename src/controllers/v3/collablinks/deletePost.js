const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const deletePostService = require("../../../services/v3/collablinks.js/deletePost")
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
  await deletePostService(request.params.postId, collabLinksProfile[0]._id);
  return serializeHttpResponse(200, {
    message: "Post Deleted",
  });
  //---------------------------------v2------------------------------------//
};

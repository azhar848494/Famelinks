const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const getMyCollablinksService = require("../../../services/v3/collablinks.js/getMyCollablinks");
const { isValidObjectId } = require("../../../utils/db");

//-----------------------v2-----------------------//
const getFollowlinksProfile = require("../../../services/v2/users/getChildProfile");
//-----------------------v2-----------------------//

module.exports = async (request) => {
  let postId = request.query.postId;
  postId = postId ? postId : "*";
  
  let followLinksProfile = await getFollowlinksProfile(
    request.user._id,
    "followlinks"
  );
  if (!followLinksProfile) {
    return serializeHttpResponse(500, {
      message: "Collablinks profile of requested user not found",
    });
  }

  if (!isValidObjectId(request.params.userId)) {
    return serializeHttpResponse(400, {
      message: "Invalid Object Id",
    });
  }
  
  let profileId = await getFollowlinksProfile(request.params.userId, 'collablinks')
  
  //request.params.userId => Followlinks Profile Id
  const result = await getMyCollablinksService(
    profileId[0]._id,
    request.query.page,
    followLinksProfile[0]._id,
    request.user._id,
    postId
  );

  return serializeHttpResponse(200, {
    message: "FollowLinks Fetched",
    result,
  });

  //-------------------------v2--------------------------//
};

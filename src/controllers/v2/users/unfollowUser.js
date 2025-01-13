const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const followUserService = require("../../../services/v2/users/followUnfollowUser");
const getOneUserService = require("../../../services/v2/users/getOneUser");
const { canUnfollow } = require("../../../data-access/v2/users");
const { isValidObjectId } = require("../../../utils/db");

module.exports = async (request) => {
  if (!isValidObjectId(request.params.followeeId)) {
    return serializeHttpResponse(400, {
      message: "Invalid followeeId",
    });
  }

  if (request.params.followeeId === request.user._id) {
    return serializeHttpResponse(400, {
      message: "FollowerId and FolloweeId cannot be same",
    });
  }

  const user = await getOneUserService(request.params.followeeId);
  if (!user) {
    return serializeHttpResponse(200, {
      message: "Followee Not found",
    });
  }

  const resFollow = await canUnfollow({type: 'user', userId: request.user._id});
  
  if (resFollow == false) {
    return serializeHttpResponse(200, {
      message: "Unfollow limit reached. Try after some time",
    });
  }

  await followUserService(request.user._id, request.params.followeeId, false);
  return serializeHttpResponse(200, {
    message: "Unfollow Success",
  });
};

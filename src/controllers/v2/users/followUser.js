const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const followUserService = require("../../../services/v2/users/followUnfollowUser");
const getOneUserService = require("../../../services/v2/users/getOneUser");
const sendNotificationsService = require("../../../services/v2/users/sendNotifications");
const { isValidObjectId } = require("../../../utils/db");
const { getUserProfileFollowlinks, canFollow } = require("../../../data-access/v2/users");

module.exports = async (request) => {
  if (!isValidObjectId(request.params.followeeId)) {
    return serializeHttpResponse(400, {
      message: "Invalid followeeId",
    });
  }

  if (request.params.followeeId.toString() === request.user._id.toString()) {
    return serializeHttpResponse(400, {
      message: "FollowerId and FolloweeId cannot be same",
    });
  }

  const user = await getOneUserService(
    request.params.followeeId,
    request.user._id
  );

  if (!user) {
    return serializeHttpResponse(200, {
      message: "Followee Not found",
    });
  }

  const profileFollowLinks = await getUserProfileFollowlinks(request.user._id);

  if (user.followStatus == "accepted") {
    return serializeHttpResponse(200, {
      message: "Followed Already",
    });
  }

  if (user.followStatus == "pending") {
    return serializeHttpResponse(200, {
      message: "Request Pending",
    });
  }

  const resFollow = await canFollow({ type: 'user', userId: request.user._id });

  if (resFollow == false) {
    return serializeHttpResponse(200, {
      message: "Follow limit reached. Try after some time",
    });
  }

  if (user.profile_type == "private") {
    await followUserService(
      request.user._id,
      request.params.followeeId,
      "request"
    );

    if (user.pushToken) {
      await sendNotificationsService(
        "followRequest",
        {
          sourceName: request.user.name,
          sourceId: request.user._id,
          sourceMedia: request.user.profileImage,
          sourceType: request.user.type,
        },
        null,
        {
          targetId: user._id,
          pushToken: user.pushToken,
          count: user.followersCount,
          userId: user._id,
          targetMedia: user.profileImage,
        },
        user.settings.notification.followRequest,
        true
      );
    }
    return serializeHttpResponse(200, {
      result: { isPrivate: user.profile_type == 'private' },
      message: "Request Success",
    });
  }

  //postId is used for recommendation
  //Check post exists with this id
  //Authorization: followeeId user is post owner

  await followUserService(request.user._id, request.params.followeeId, true, request.body.postId);

  // NOTE:- Uncomment this if press follow button -> following
  if (user.pushToken) {
    await sendNotificationsService(
      "followUser",
      {
        sourceName: request.user.name,
        sourceId: request.user._id,
        sourceMedia: profileFollowLinks.profileImage,
        sourceMediaType: profileFollowLinks.profileImageType,
        sourceType: request.user.type,
      },
      null,
      {
        targetId: user._id,
        pushToken: user.pushToken,
        count: user.followersCount,
        userId: user._id,
        targetMedia: user.profileImage,
      },
      user.settings.notification.newFollower,
      true
    );
  }
  return serializeHttpResponse(200, {
    result: {
      isPrivate: user.profile_type == 'private'
    },
    message: "Follow success",
  });
  // // NOTE:- Uncomment this if press follow button -> send request -> accept request -> following
};

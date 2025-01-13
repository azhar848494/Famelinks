const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const submitLikeService = require("../../../services/v2/likes/submitLike");
const { isValidObjectId } = require("../../../utils/db");
const deleteLikeService = require("../../../services/v2/likes/deleteLike");
const getOneCommentService = require("../../../services/v2/comments/getOneComment");
const getOneUserService = require("../../../services/v2/users/getOneUser");
const sendNotificationsService = require("../../../services/v2/users/sendNotifications");

const getMasterProfile = require("../../../services/v2/users/getMasterProfile");

module.exports = async (request, postType) => {
  if (!isValidObjectId(request.params.id)) {
    return serializeHttpResponse(400, {
      message: "Invalid Object Id",
    });
  }

  const getOnePostService = require(`../../../services/v2/${postType}/getOnePost`);

  if (request.params.type === "media") {
    const onePost = await getOnePostService(request.params.id);

    if (!onePost) {
      return serializeHttpResponse(200, {
        message: "Post not found",
      });
    }

    let targetMedia;
    switch (postType) {
      case "famelinks":
        targetMedia =
          onePost.closeUp ||
          onePost.medium ||
          onePost.pose1 ||
          onePost.pose2 ||
          onePost.long ||
          onePost.additional ||
          onePost.video;
        break;
      case "funlinks":
        targetMedia = onePost.video;
        break;
      case "followlinks":
        targetMedia =
          onePost.closeUp ||
          onePost.medium ||
          onePost.pose1 ||
          onePost.pose2 ||
          onePost.long ||
          onePost.additional ||
          onePost.video;
        break;
      case "collablinks":
        targetMedia = onePost.media[0].media;
        break;
    }
    if (request.body.status === 3) {
      return serializeHttpResponse(400, {
        message: "like status must be one of 0, 1, 2 or null",
      });
    }
    if (request.body.status == null) {
      await deleteLikeService(
        request.user._id,
        onePost.userId,
        request.params.id,
        postType
      );
    } else {
      await submitLikeService(
        request.user._id,
        onePost.userId,
        request.params.id,
        request.body.status,
        postType
      );
      const user = await getOneUserService(onePost.userId);
      if (user.pushToken && request.body.status !== 0) {
        await sendNotificationsService(
          "likePost",
          {
            sourceName: request.user.name,
            sourceId: request.user._id,
            sourceMedia: request.user.profileImage,
            sourceMediaType: request.user.profileImageType,
            sourceType: request.user.type,
          },
          request.body.status,
          {
            targetId: request.params.id,
            pushToken: user.pushToken,
            count: onePost.likes1Count,
            userId: user._id,
            targetMedia,
            postType,
          },
          user.settings.notification.likes,
          true
        );
      }
    }
  } else {
    const oneComment = await getOneCommentService(request.params.id);
    if (!oneComment) {
      return serializeHttpResponse(200, {
        message: "Comment not found",
      });
    }
    if ([0, 1, 2].includes(request.body.status)) {
      return serializeHttpResponse(400, {
        message: "status must be one of 3 or null",
      });
    }
    if (request.body.status == null) {
      await deleteLikeService(
        request.user._id,
        oneComment.userId,
        request.params.id
      );
    } else {
      await submitLikeService(
        request.user._id,
        oneComment.userId,
        request.params.id,
        request.body.status
      );
      const onePost = await getOnePostService(oneComment.mediaId);
      const masterUserId = await getMasterProfile(oneComment.userId);
      const user = await getOneUserService(masterUserId[0]._id);
      if (user.pushToken) {
        await sendNotificationsService(
          "likeComment",
          {
            sourceName: childProfile[0].name,
            sourceId: request.user._id,
            sourceMedia: childProfile[0].profileImage,
            sourceMediaType: childProfile[0].profileImageType,
            sourceType: request.user.type,
          },
          null,
          {
            targetId: request.params.id,
            pushToken: user.pushToken,
            count: oneComment.likesCount,
            userId: user._id,
            postType,
          },
          user.settings.notification.likes,
          true
        );
      }
    }
  }

  const result = await getOnePostService(request.params.id);

  return serializeHttpResponse(200, {
    message: "Like Status Updated",
    result,
  });
};

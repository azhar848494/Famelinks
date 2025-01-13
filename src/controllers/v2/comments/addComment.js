const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const addCommentService = require("../../../services/v2/comments/addComment");
const getOneCommentService = require("../../../services/v2/comments/getOneComment");
const { isValidObjectId } = require("../../../utils/db");
const getOneUserService = require("../../../services/v2/users/getOneUser");
const sendNotificationsService = require("../../../services/v2/users/sendNotifications");

module.exports = async (request, postType) => {
  let linkType = postType;
  if (!isValidObjectId(request.params.mediaId)) {
    return serializeHttpResponse(400, {
      message: "Invalid Object Id",
    });
  }

  if (request.body.parentId) {
    if (!isValidObjectId(request.body.parentId)) {
      return serializeHttpResponse(400, {
        message: "Invalid Object Id",
      });
    }

    const oneComment = await getOneCommentService(request.body.parentId);
    if (!oneComment) {
      return serializeHttpResponse(200, {
        message: "Parent Comment not found",
      });
    }
  }

  const getOnePostService = require(`../../../services/v2/${postType}/getOnePost`);

  const onePost = await getOnePostService(request.params.mediaId);

  if (!onePost) {
    return serializeHttpResponse(200, {
      message: "Post not found",
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

  //MasterIdMigration
  await addCommentService(
    request.user._id,
    request.params.mediaId,
    request.body.body,
    request.body.parentId,
    postType,
    request,
    onePost.userId
  );

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

  const user = await getOneUserService(onePost.userId);

  // const user = await getOneUserService(onePost.userId);

  if (user.pushToken) {
    await sendNotificationsService(
      "commentPost",
      {
        sourceName: request.user.name,
        sourceId: request.user._id,
        sourceMedia: request.user.profileImage,
        sourceMediaType: request.user.profileImageType,
        sourceType: request.user.type,
      },
      null,
      {
        targetId: request.params.mediaId,
        pushToken: user.pushToken,
        count: onePost.commentsCount,
        userId: user._id,
        targetMedia,
        postType,
      },
      user.settings.notification.comments,
      true
    );
  }

  return serializeHttpResponse(200, {
    message: "Comment Added",
  });
};

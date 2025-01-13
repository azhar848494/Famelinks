const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const inviteToFollow = require("../../../services/v2/users/inviteToFollow");
const { getTodaysInvites } = require("../../../data-access/v2/users");
const { isValidObjectId } = require("../../../utils/db");
const appConfig = require("../../../../configs/app.config");
const { checkInvitation } = require("../../../data-access/v2/users");
const sendNotificationsService = require("../../../services/v2/users/sendNotifications");
const settingsDB = require("../../../models/v2/settings");
const { getOneUser } = require("../../../data-access/v2/users");

module.exports = async (request) => {
  let action = request.params.action;
  let userId = request.params.userId;

  if (!isValidObjectId(userId)) {
    return serializeHttpResponse(400, {
      message: "Invalid user Id",
    });
  }
  const user = await getOneUser(userId);

  let settings = await settingsDB.findOne({ _id: appConfig.settingsId })
  let count = await getTodaysInvites(request.user._id)

  if (count > settings.followInviteDailyLimit) {
      return serializeHttpResponse(400, {
          message: 'You have reached daily limit of sending invitations'
      })
  }

  let invitation = await checkInvitation(userId, request.user._id, "follow");

  if (invitation && action == "send") {
    return serializeHttpResponse(400, {
      message:
        "User already invited to follow. Cannot re-send invitation to the user.",
    });
  }

  let result = await inviteToFollow(userId, request.user._id, action);

  if (!result) {
    let message =
      action == "send"
        ? "Failed to send invitation"
        : "Failed to withdraw invitation";
    return serializeHttpResponse(500, {
      message,
    });
  }
  if (request.user.pushToken && result && action == "send") {
    await sendNotificationsService(
      "followInvitation",
      {
        sourceName: request.user.name,
        sourceId: request.user._id,
        sourceMedia: request.user.profileImage,
        sourceType: request.user.type,
      },
      null,
      {
        targetId: userId,
        pushToken: user.pushToken,
        //count: user.followersCount,
        category: "requests",
        userId: user._id,
        targetMedia: user.profileImage,
      },
      true,
      true
    );
  }

  let message =
    action == "send"
      ? "Invite sent successfuly"
      : "Invite withdrawn successfuly";
  return serializeHttpResponse(200, {
    message,
  });
};

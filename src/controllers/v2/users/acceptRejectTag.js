const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const acceptRejectTag = require("../../../services/v2/users/acceptRejectTag");
const {
  getTagByPostId,
  getNotificationByTagId,
  deleteNotification,
} = require("../../../data-access/v2/users");
const { isValidObjectId } = require("../../../utils/db");
const { getJob, deleteInvite } = require("../../../data-access/v2/joblinks");

module.exports = async (request) => {
 let postId = request.params.postId;
 let action = request.params.action;
 let receiverId = request.user._id

 if (!isValidObjectId(postId)) {
   return serializeHttpResponse(400, {
     message: "Invalid post Id",
   });
 }

  const Tag = await getTagByPostId(postId, receiverId);

  if (!Tag) {
    return serializeHttpResponse(400, {
      message: "Tag not found",
    });
  }

  let result = await acceptRejectTag(postId,receiverId,action);

  if (!result) {
    let message =
      action == "accept" ? "Failed to accept Tag" : "Failed to reject Tag";
    return serializeHttpResponse(500, {
      message,
    });
  }
  let notification = await getNotificationByTagId(postId);
  if(notification){
    await deleteNotification(postId);
  }

  let message =
    action == "accept"
      ? "Tag accepted successfuly"
      : "Tag rejected successfuly";
  return serializeHttpResponse(200, {
    message,
  });

};

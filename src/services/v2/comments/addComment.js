const { addComment, updateCommentRepliesCounter } = require("../../../data-access/v2/comments");
const famelinksDao = require("../../../data-access/v2/famelinks");
const funlinksDao = require("../../../data-access/v2/funlinks");
const followlinksDao = require("../../../data-access/v2/followlinks");
const collablinks = require("../../../data-access/v3/collablinks")
const Filter = require('bad-words');
const getOneUserService = require("../../../services/v2/users/getOneUser");
const sendNotificationsService = require("../../../services/v2/users/sendNotifications");

module.exports = async (userId, postId, body, parentId, postType, request, id) => {
    
    await addComment(userId, postId, body, parentId);

    if (parentId) {
        return updateCommentRepliesCounter(parentId, 1);
    } else {
        switch (postType) {
          case "famelinks":
            return famelinksDao.updatePostCommentCounter(postId, 1);
          case "funlinks":
            return funlinksDao.updatePostCommentCounter(postId, 1);
          case "followlinks":
            return followlinksDao.updatePostCommentCounter(postId, 1);
          case "collablinks":
            return collablinks.updatePostCommentCounter(postId, 1);
        }
    }

    if (!body.includes(new Filter().clean(body))) {
      console.log("comment")
      const user = await getOneUserService(id);
      if (user.pushToken) {
          await sendNotificationsService('badWord', {
              sourceName: 'You',
              sourceId: request.user._id,
              sourceMedia: request.user.profileImage,
              sourceType: request.user.type
          }, null, {
              targetId: request.params.mediaId,
              pushToken: user.pushToken,
              userId: user._id,
              postType
          }, user.settings.notification.comments, true);
      }
  }
};
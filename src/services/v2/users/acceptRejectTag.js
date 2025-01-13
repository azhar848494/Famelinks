const { acceptRejectTag } = require("../../../data-access/v2/users");

module.exports = async (postId, receiverId, action) => {
  return await acceptRejectTag(postId, receiverId, action);
};

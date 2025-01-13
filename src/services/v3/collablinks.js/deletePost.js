const { deletePost } = require("../../../data-access/v3/collablinks");

module.exports = (postId, userId) => {
  return deletePost(postId, userId);
};

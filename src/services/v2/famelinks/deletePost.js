const {
  deletePost,
  deleteLike,
  deleteComment,
  decreaseCount,
} = require("../../../data-access/v2/famelinks");
const {
  updateUserLikeCommentsCount,
} = require("../../../data-access/v2/users");

module.exports = async (postId, userId, challengeId) => {
  const deletedPost = await deletePost(postId, userId);
  await deleteLike(postId);
  await deleteComment(postId);
  await decreaseCount(challengeId);
  return updateUserLikeCommentsCount(
    userId,
    deletedPost["likes1Count"]
      ? deletedPost["likes1Count"] - deletedPost["likes1Count"] * 2
      : 0,
    deletedPost["likes2Count"]
      ? deletedPost["likes2Count"] - deletedPost["likes2Count"] * 2
      : 0,
    deletedPost["commentsCount"]
      ? deletedPost["commentsCount"] - deletedPost["commentsCount"] * 2
      : 0
  );
};

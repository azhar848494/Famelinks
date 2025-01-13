const {
  followUser,
  unfollowUser,
  updateFollowersCount,
  updateFollowingCount,
  followRequest,
} = require("../../../data-access/v2/users");

module.exports = async (followerId, followeeId, isFollow, postId) => {
  if (isFollow == true) {
    await followUser(followerId, followeeId, new Date(), "user", postId);
    await updateFollowersCount(followeeId, 1);
    await updateFollowingCount(followerId, 1);
    return;
  }
  if (isFollow == "request") {
    await followRequest(followerId, followeeId, "user", postId);
    return;
  }
  await unfollowUser(followerId, followeeId, "user", postId);
  await updateFollowersCount(followeeId, -1);
  await updateFollowingCount(followerId, -1);
  return;
};

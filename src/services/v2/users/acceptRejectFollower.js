const { acceptRequest, unfollowUser, updateFollowersCount, updateFollowingCount } = require("../../../data-access/v2/users");

module.exports = async (followerId, followeeId, accept) => {
    let result

    if (accept) {
        result = await acceptRequest(followerId, followeeId);
        await updateFollowersCount(followeeId, 1);
        await updateFollowingCount(followerId, 1);
        return result;
    }
    result = await unfollowUser(followerId, followeeId, "user");
    return result;
};
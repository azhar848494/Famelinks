const { getChatByMembers } = require("../../../data-access/v2/chats");
const { getFollowers, getFollowees } = require("../../../data-access/v2/users");

module.exports = async (userId, type, page, selfUserId, requestType) => {
    let data;
    if (type == 'followers') {
        data = await getFollowers(userId, page, selfUserId);
    } else {
        data = await getFollowees(userId, page, selfUserId, requestType);
    }
    return data;
};
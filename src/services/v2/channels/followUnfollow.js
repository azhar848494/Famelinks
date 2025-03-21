const { followUnfollow } = require('../../../data-access/v2/channels')

const { updateFollowingCount } = require("../../../data-access/v2/users");

module.exports = async (masterId, channelId, action) => {
    await updateFollowingCount(masterId, action == 'follow' ? 1 : -1);
    return await followUnfollow(masterId, channelId, action, new Date(), 'channel');
}
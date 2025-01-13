const { followUnfollow } = require('../../../data-access/v2/channels')

module.exports = async (masterId, channelId, action) => {
    return await followUnfollow(masterId, channelId, action, new Date(), 'channel')
}
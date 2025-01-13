const { getChannelById } = require('../../../data-access/v2/channels')

module.exports = async (channelId) => {
    return await getChannelById(channelId)
}
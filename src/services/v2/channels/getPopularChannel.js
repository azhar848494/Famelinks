const { getPopularChannel } = require('../../../data-access/v2/channels')

module.exports = async (userId, search, page) => {
    return await getPopularChannel(userId, search, page)
}
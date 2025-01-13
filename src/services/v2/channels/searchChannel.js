const { searchChannel } = require('../../../data-access/v2/channels')

module.exports = async (userId, data, page) => {
    return await searchChannel(userId, data, page)
}
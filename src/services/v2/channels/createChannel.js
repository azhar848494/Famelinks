const { createChannel } = require('../../../data-access/v2/channels')

module.exports = async (payload) => {
    return await createChannel(payload)
}
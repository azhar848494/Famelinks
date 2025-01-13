const { closeChat } = require('../../../data-access/v3/chats')

module.exports = async (chatId) => {
    return await closeChat(chatId)
}
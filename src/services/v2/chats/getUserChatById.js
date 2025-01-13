const { getUserChatById } = require("../../../data-access/v2/chats");

module.exports = (userId, chatId) => {
    return getUserChatById(userId, chatId);
};
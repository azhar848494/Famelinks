const { getUserChatById } = require("../../../data-access/v3/chats");

module.exports = (userId, chatId) => {
    return getUserChatById(userId, chatId);
};
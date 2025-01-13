const { markAsRead } = require("../../../data-access/v2/chats");

module.exports = async (chatId, userId) => {
    return markAsRead(chatId, userId);
};
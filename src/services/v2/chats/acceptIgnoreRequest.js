const { acceptChatRequest, deleteChat, deleteChatMessages } = require("../../../data-access/v2/chats");

module.exports = async (chatId, decision, userId) => {
    if (decision) {
        return acceptChatRequest(chatId, userId);
    } else {
        await deleteChatMessages(chatId);
        return deleteChat(chatId);
    }
};
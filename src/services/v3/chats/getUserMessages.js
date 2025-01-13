const { getUserMessages } = require("../../../data-access/v3/chats");

module.exports = (chatId, page, chatCategory) => {
    return getUserMessages(chatId, page, chatCategory);
};
const { getChatMessages } = require("../../../data-access/v2/chats");

module.exports = (userId,selfUserId,category, page) => {
    return getChatMessages(userId, selfUserId,category, page);
};
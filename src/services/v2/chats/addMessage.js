const { addMessage } = require("../../../data-access/v2/chats");
const sendNotificationsService = require("../users/sendNotifications");

module.exports = async (chatId, body, senderId, quote, type, {
    profileImage,
    sourceName,
    sourceType,
    pushToken,
    targetId
}) => {
    const result = await addMessage(chatId, body, senderId, quote, type);
    await sendNotificationsService('sendMessage', {
        sourceId: senderId,
        sourceMedia: profileImage,
        sourceName,
        sourceType
    }, null, {
        pushToken,
        targetId,
        userId: targetId
    }, true, false);
    return result;
};
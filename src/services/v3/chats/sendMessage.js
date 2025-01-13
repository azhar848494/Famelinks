const addMessageService = require("./addMessage");
const getChatByMembersService = require("./getChatByMembers");
const createChatService = require("./createChats");

module.exports = async (senderId, senderProfileImage, senderName, receiverId, receiverPushToken, body, quote, senderType, jobId, type) => {
    let chat = await getChatByMembersService([receiverId, senderId], jobId);
    if (!chat) {
        chat = await createChatService(null, [receiverId, senderId], [receiverId], jobId);
    }

    const message = await addMessageService(
      chat._id,
      body,
      senderId,
      quote,
      type,
      {
        sourceImage: senderProfileImage,
        sourceName: senderName,
        pushToken: receiverPushToken,
        targetId: receiverId,
        sourceType: senderType,
      }
    );
    return message;
};
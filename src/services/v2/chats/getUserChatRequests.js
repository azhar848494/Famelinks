const { getUserChatRequests, getUserChatRequestsCount } = require("../../../data-access/v2/chats");
const { getOneUser } = require("../../../data-access/v2/users");

module.exports = async (userId, page, blockList) => {
    const chats = await getUserChatRequests(userId, page);
    const result = await getUserChatRequestsCount(userId);
    const chatsCount = result[0] && result[0].requestCount ? result[0].requestCount : 0;
    const mappedChats = await Promise.all(chats.map(async chat => {
        if (!chat.isGroup) {
            const otherUserId = chat.members.find(memberId => memberId.toString() != userId.toString());
            console.log(otherUserId);
            if (blockList.map(userId => userId.toString()).includes(otherUserId.toString())) {
                return;
            }
            const { name, profileImage, _id, type } = await getOneUser(otherUserId);
            chat.title = name;
            chat.image = profileImage;
            chat.userId = _id;
            chat.type = type;
        }
        delete chat.members;
        return chat;
    }));
    return {
        data: mappedChats.filter(item => item),
        count: chatsCount
    };
};
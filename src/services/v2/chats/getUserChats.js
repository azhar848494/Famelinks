const { getUserChats } = require("../../../data-access/v3/chats");
const { getOneUser } = require("../../../data-access/v2/users");

module.exports = async (userId, page, blockList) => {
  const chats = await getUserChats(userId, page);
  const mappedChats = await Promise.all(
    chats.map(async (chat) => {
      if (!chat.isGroup) {
        const otherUserId = chat.members.find(
          (memberId) => memberId.toString() !== userId.toString()
        );
        console.log(otherUserId);
        if (
          blockList
            .map((userId) => userId.toString())
            .includes(otherUserId.toString())
        ) {
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
    })
  );
  return mappedChats.filter((item) => item);
};

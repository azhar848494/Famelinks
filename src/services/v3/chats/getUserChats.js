const { getUserChats, getUserJobChats } = require("../../../data-access/v3/chats");
const { getOneUser } = require("../../../data-access/v2/users");

module.exports = async (userId, page, blockList) => {
  let chats = []
  let jobChats = []
  chats = await getUserChats(userId, page);
  jobChats = await getUserJobChats(userId, page);
  chats = chats.concat(jobChats)
  const mappedChats = await Promise.all(
    chats.map(async (chat) => {
      if (!chat.isGroup) {
        const otherUserId = chat.members.find((memberId) => memberId.toString() !== userId.toString());
        if (blockList.map((userId) => userId.toString()).includes(otherUserId.toString())) {
          return;
        }
        const { name, profileImage, _id } = await getOneUser(otherUserId);
        chat.title = name;
        chat.image = profileImage;
        chat.userId = _id;
      }
      delete chat.members;
      return chat;
    })
  );
  return mappedChats.filter((item) => item);
};

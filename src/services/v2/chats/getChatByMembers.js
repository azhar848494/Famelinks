const { getChatByMembers } = require("../../../data-access/v2/chats");

module.exports = (memberIds) => {
    return getChatByMembers(memberIds);
};
const { getChatByMembers } = require("../../../data-access/v3/chats");

module.exports = (memberIds, jobId) => {
    return getChatByMembers(memberIds, jobId);
};
const { createChat } = require("../../../data-access/v3/chats");

module.exports = (title, members, requests, jobId) => {
    return createChat(title, members, requests, jobId);
};
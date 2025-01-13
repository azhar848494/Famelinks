const { createChat } = require("../../../data-access/v2/chats");

module.exports = (title, members, requests) => {
    return createChat(title, members, requests);
};
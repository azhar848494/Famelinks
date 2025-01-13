const { markAsRead } = require("../../../data-access/v2/users");

module.exports = (userId) => {
    return markAsRead(userId);
};
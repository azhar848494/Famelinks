const { markAsRead } = require("../../../data-access/v2/users");

module.exports = (userId, type) => {
    return markAsRead(userId, type);
};
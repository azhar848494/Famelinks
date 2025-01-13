const { getNotifications } = require("../../../data-access/v2/users");

module.exports = (userId, page, type, category) => {
    return getNotifications(userId, page , type, category);
};
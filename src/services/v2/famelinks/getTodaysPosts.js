const { getTodaysPosts } = require("../../../data-access/v2/famelinks");

module.exports = (userId) => {
    return getTodaysPosts(userId);
};
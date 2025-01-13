const { getSavedMusicIds } = require("../../../data-access/v2/users");

module.exports = (userId) => {
    return getSavedMusicIds(userId);
};
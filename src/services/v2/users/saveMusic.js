const { saveMusic } = require("../../../data-access/v2/users");

module.exports = async (userId, musicId) => {
    return saveMusic(userId, musicId);
};
const { unsaveMusic } = require("../../../data-access/v2/users");

module.exports = async (userId, musicId) => {
    return unsaveMusic(userId, musicId);
};
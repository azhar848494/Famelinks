const { getUserByUsername } = require("../../../data-access/v2/users");

module.exports = (username) => {
    return getUserByUsername(username);
};
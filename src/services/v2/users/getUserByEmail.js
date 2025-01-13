const { findUserByEmail } = require("../../../data-access/v2/users");

module.exports = (email) => {
    return findUserByEmail(email);
};
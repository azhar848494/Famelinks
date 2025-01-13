const { findUserByMobileNumber } = require("../../../data-access/v2/users");

module.exports = (mobileNumber) => {
    return findUserByMobileNumber(mobileNumber);
};
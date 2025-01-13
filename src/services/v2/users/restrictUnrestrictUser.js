const {
  restrictUser,
  unrestrictUser,
} = require("../../../data-access/v2/users");

module.exports = async (userId, restrictUserId, isRestrict) => {
  if (isRestrict) {
    return restrictUser(userId, restrictUserId);
  } else {
    return unrestrictUser(userId, restrictUserId);
  }
};

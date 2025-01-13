const { updatePrivacy } = require("../../../data-access/v2/users");

module.exports = async (userId, action) => {
  return updatePrivacy(userId, action);
};

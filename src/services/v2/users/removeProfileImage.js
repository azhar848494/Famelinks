const { updateprofileImage } = require("../../../data-access/v2/users");

module.exports = async (masterUserId, productId) => {
  return await updateprofileImage(masterUserId);
};

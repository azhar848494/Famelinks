const { findAndUpdateUser } = require('../../../data-access/v2/users');

module.exports = async (file, userId) => {
  return findAndUpdateUser(userId, {
    verificationVideo: file,
    verificationStatus: "Submitted",
  });
};
const { insertRecognition } = require('../../../data-access/v2/users');

module.exports = async (userId, video) => {
  return insertRecognition(userId, video);
};
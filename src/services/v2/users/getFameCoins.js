const { getFameCoins } = require("../../../data-access/v2/users");

module.exports = (userId) => {
  return getFameCoins(userId);
};

const { getSetting } = require("../../../data-access/v2/users");

module.exports = async (type) => {
  return await getSetting(type);
};

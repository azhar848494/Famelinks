const { updateSetting } = require("../../../data-access/v2/users");

module.exports = async (id, data) => {
  return updateSetting(id, data);
};

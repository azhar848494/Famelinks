const { createfametrendz } = require("../../../data-access/v3/fametrendzs");

module.exports = async (payload) => {
  return await createfametrendz(payload);
};

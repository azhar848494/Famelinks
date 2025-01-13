const { updateFametrendz } = require("../../../data-access/v3/fametrendzs");

module.exports = async (trendzId, payload) => {
  return await updateFametrendz(trendzId, payload);
};

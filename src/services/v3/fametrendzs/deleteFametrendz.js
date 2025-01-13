const { deleteFametrendz } = require("../../../data-access/v3/fametrendzs");

module.exports = async (trendzId) => {
  return await deleteFametrendz(trendzId);
};

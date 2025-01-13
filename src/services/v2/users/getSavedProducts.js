const { getSavedBrandProducts } = require("../../../data-access/v2/users");

module.exports = async (page, masterId) => {
  return await getSavedBrandProducts(masterId, page);
};

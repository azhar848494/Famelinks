const {
  getAgencyBySearch,
} = require("../../../data-access/v2/users");

module.exports = async (searchData, selfMasterId) => {
  let result = [];

  result = await getAgencyBySearch(searchData, selfMasterId);

  return result;
};

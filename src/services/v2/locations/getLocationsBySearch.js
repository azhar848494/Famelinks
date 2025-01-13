const {
  getLocationBySearch,
} = require("../../../data-access/v2/locations");

module.exports = (search_type, where, page) => {
  return getLocationBySearch(search_type, where, page);
};

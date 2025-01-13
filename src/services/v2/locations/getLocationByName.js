const { getLocationByName } = require("../../../data-access/v2/locations");

module.exports = (name) => {
  return getLocationByName(name);
};

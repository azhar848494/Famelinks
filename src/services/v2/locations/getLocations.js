const {
  getLocationsByText,
  findLocationsByText,
} = require("../../../data-access/v2/locations");

exports.getLocationsService = (data,  page) => {
  return getLocationsByText(data.toLowerCase(), page);
};

exports.findLocationsService = (data,  page) => {
  return findLocationsByText(data.toLowerCase(), page);
};
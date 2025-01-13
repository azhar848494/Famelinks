const { getAllLocations } = require("../../../data-access/v2/locations");

module.exports = () => {
    return getAllLocations(); 
};
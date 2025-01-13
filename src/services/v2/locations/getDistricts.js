const { getDistrictsByState } = require("../../../data-access/v2/locations");

module.exports = async (country, state) => {
    const [ result ] = await getDistrictsByState(country, state);
    return result;
};
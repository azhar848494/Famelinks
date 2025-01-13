const { getStatesByCountry } = require("../../../data-access/v2/locations");

module.exports = async (country) => {
    const [ result ] = await getStatesByCountry(country);
    return result;
};
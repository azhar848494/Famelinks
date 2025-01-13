const { getCountriesByContinent } = require("../../../data-access/v2/locations");

module.exports = async (continent) => {
    const [ result ] = await getCountriesByContinent(continent);
    return result;
};
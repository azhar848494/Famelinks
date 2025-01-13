const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const getCountriesService = require('../../../services/v2/locations/getCountries');

module.exports = async (request) => {
    const result = await getCountriesService(request.query.continent);

    return serializeHttpResponse(200, {
        message: 'Countries Fetched',
        result
    });
};
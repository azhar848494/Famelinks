const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const getDistrictsService = require('../../../services/v2/locations/getDistricts');

module.exports = async (request) => {
    const result = await getDistrictsService(request.query.country, request.query.state);

    return serializeHttpResponse(200, {
        message: 'Countries Fetched',
        result: {
            districts: result && result.districts ? result.districts : []
        }
    });
};
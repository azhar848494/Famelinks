const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const getAllLocationService = require('../../../services/v2/locations/getAllLocation');

module.exports = async (request) => {
    const result = await getAllLocationService();

    return serializeHttpResponse(200, {
        message: 'Location Fetched',
        result
    });
};
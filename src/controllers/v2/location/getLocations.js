const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const LocationsService = require('../../../services/v2/locations/getLocations');

exports.getLocationsController = async (request) => {
    const result = await LocationsService.getLocationsService(request.query.search, request.query.page);

    return serializeHttpResponse(200, {
        message: 'Location Fetched',
        result
    });
};

exports.findLocationsController = async (request) => {
    const result = await LocationsService.findLocationsService(request.query.search, request.query.page);

    return serializeHttpResponse(200, {
        message: 'Location Fetched',
        result
    });
};
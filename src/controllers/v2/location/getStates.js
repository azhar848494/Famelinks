const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const getStatesService = require('../../../services/v2/locations/getStates');

module.exports = async (request) => {
    const result = await getStatesService(request.query.country);

    return serializeHttpResponse(200, {
        message: 'States Fetched',
        result: {
            states: result && result.states ? result.states : []
        }
    });
};
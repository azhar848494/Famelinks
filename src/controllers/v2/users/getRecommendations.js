const serializeHttpResponse = require('../../../helpers/serialize-http-response');
const getRecommendationsService = require('../../../services/v2/users/getRecommendations');
const getOneUserService = require('../../../services/v2/users/getOneUser');
const { isValidObjectId } = require('../../../utils/db');

module.exports = async (request) => {
    if (!isValidObjectId(request.params.agencyId)) {
        return serializeHttpResponse(400, {
            message: 'Invalid agency Id'
        });
    }

    const user = await getOneUserService(request.params.agencyId);
    if (!user) {
        return serializeHttpResponse(200, {
            message: 'Agency not found',
        });
    }

    const result = await getRecommendationsService(request.user._id, request.params.agencyId);

    return serializeHttpResponse(200, {
        message: 'Recommendation Fetched',
        result
    });
};
const serializeHttpResponse = require('../../../helpers/serialize-http-response');
const addRecommendationService = require('../../../services/v2/users/addRecommendation');
const getOneUserService = require('../../../services/v2/users/getOneUser');
const { isValidObjectId } = require('../../../utils/db');

module.exports = async (request) => {
    if (!isValidObjectId(request.body.agencyId)) {
        return serializeHttpResponse(400, {
            message: 'Invalid agency Id'
        });
    }

    const user = await getOneUserService(request.body.agencyId);
    if (!user) {
        return serializeHttpResponse(200, {
            message: 'Agency not found',
        });
    }

    await addRecommendationService(request.user._id, request.body.recommendations, request.body.agencyId);

    return serializeHttpResponse(200, {
        message: 'Recommendation added',
    });
};
const serializeHttpResponse = require('../../../helpers/serialize-http-response');
const getContestantsService = require('../../../services/v2/users/getContestants');

module.exports = async (request) => {
    const result = await getContestantsService(request.user._id, request.query);
    return serializeHttpResponse(200, {
        message: 'Contestants fetched',
        result: result.users
    });
};
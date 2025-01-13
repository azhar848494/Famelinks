const serializeHttpResponse = require('../../../helpers/serialize-http-response');
const getContestantsService = require('../../../services/v2/users/getContestants');

module.exports = async (request) => {
    const result = await getContestantsService(request.user._id, {
        search: request.body.search,
        page: request.body.page,
        postType: request.body.type
    }, true, request.user._id, request.user._id, request.user.type);
    return serializeHttpResponse(200, {
        message: 'Contestants fetched',
        result
    });
};
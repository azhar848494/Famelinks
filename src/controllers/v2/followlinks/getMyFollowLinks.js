const serializeHttpResponse = require('../../../helpers/serialize-http-response');
const getMyFollowLinksService = require('../../../services/v2/followlinks/getMyFollowLinks');

module.exports = async (request) => {
    const result = await getMyFollowLinksService(request.user._id, request.query.page, request.user._id);
    return serializeHttpResponse(200, {
        message: 'FollowLinks Fetched',
        result
    });
};
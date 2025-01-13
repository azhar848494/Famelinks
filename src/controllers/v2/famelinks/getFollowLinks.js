const serializeHttpResponse = require('../../../helpers/serialize-http-response');
const getMyFollowLinksService = require('../../../services/v2/famelinks/getFollowLinks');

module.exports = async (request) => {
    const result = await getMyFollowLinksService(request.user._id, request.query.page);
    return serializeHttpResponse(200, {
        message: 'FameLinks FollowLinks Fetched',
        result
    });
};
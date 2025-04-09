const serializeHttpResponse = require('../../../helpers/serialize-http-response');
const getMusicService = require('../../../services/v2/funlinks/getMusic');

module.exports = async (request) => {
    const result = await getMusicService(request.query.page, request.query.search, request.query.type, request.user._id, request.query.isMyMusic);
    return serializeHttpResponse(200, {
        message: 'FunLink Music Fetched',
        result
    });
};
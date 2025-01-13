const serializeHttpResponse = require('../../../helpers/serialize-http-response');
const getAdFameLinksService = require('../../../services/v2/famelinks/getAdfamelinks');

module.exports = async (request) => {
    const result = await getAdFameLinksService(request.user._id, request.query.page);
    return serializeHttpResponse(200, {
        message: 'FameLinks Fetched',
        result
    });
};
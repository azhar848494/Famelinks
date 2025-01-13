const serializeHttpResponse = require('../../../helpers/serialize-http-response');
const getMyFunLinksService = require('../../../services/v2/funlinks/getMyFunLinks');

module.exports = async (request) => {
    const result = await getMyFunLinksService(request.user._id, request.query.page, request.user._id);
    return serializeHttpResponse(200, {
        message: 'FunLinks Fetched',
        result
    });

};
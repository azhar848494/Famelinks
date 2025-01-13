const serializeHttpResponse = require('../../../helpers/serialize-http-response');
const getMyFameLinksService = require('../../../services/v2/famelinks/getMyFameLinks');
const { isValidObjectId } = require('../../../utils/db');

module.exports = async (request) => {
    let hashTagId = request.query.hashTagId;

    if (!isValidObjectId(request.params.userId)) {
        return serializeHttpResponse(400, {
            message: 'Invalid Object Id'
        });
    }
    
    const result = await getMyFameLinksService(request.params.userId, request.query.page, request.user._id, request.user._id, hashTagId);
    return serializeHttpResponse(200, {
        message: 'FameLinks Fetched',
        result
    });
};
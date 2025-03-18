const serializeHttpResponse = require('../../../helpers/serialize-http-response');
const getMyFollowLinksService = require('../../../services/v2/followlinks/getMyFollowLinks');
const { isValidObjectId } = require('../../../utils/db');

module.exports = async (request) => {
    let hashTagId = request.query.hashTagId;

    if (!isValidObjectId(request.params.userId)) {
        return serializeHttpResponse(400, {
            message: 'Invalid Object Id'
        });
    }
    
    const result = await getMyFollowLinksService(
        request.params.userId,
        request.query.page,
        request.user._id,
        request.user._id,
        hashTagId
    );

    return serializeHttpResponse(200, {
        message: 'FollowLinks Fetched',
        result
    });
};
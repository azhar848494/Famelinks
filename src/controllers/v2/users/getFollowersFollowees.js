const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const getFollowersFollowees = require('../../../services/v2/users/getFollwersFollowees');
const getOneUserService = require('../../../services/v2/users/getOneUser');
const { isValidObjectId } = require("../../../utils/db");

module.exports = async (request) => {
    if (!isValidObjectId(request.params.userId)) {
        return serializeHttpResponse(400, {
            message: 'Invalid UserId'
        });
    }

    const user = await getOneUserService(request.params.userId);
    if (!user) {
        return serializeHttpResponse(200, {
            message: 'User Not found',
        });
    }
    const result = await getFollowersFollowees(request.params.userId, request.params.type, request.query.page, request.user._id, request.query.requestType);
    return serializeHttpResponse(200, {
        message: 'Fetched',
        result
    });
};
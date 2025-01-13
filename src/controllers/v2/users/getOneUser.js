const serializeHttpResponse = require('../../../helpers/serialize-http-response');
const getOneUserService = require('../../../services/v2/users/getOneUser');
const { isValidObjectId } = require('../../../utils/db');

module.exports = async (request) => {
    if (!isValidObjectId(request.params.userId)) {
        return serializeHttpResponse(400, {
            message: 'Invalid User Id'
        });
    }

    const result = await getOneUserService(request.params.userId, request.user._id);

    if (!result) {
        return serializeHttpResponse(200, {
            message: 'User not found'
        });
    }
    return serializeHttpResponse(200, {
        result,
        message: 'User Fetched'
    });
};
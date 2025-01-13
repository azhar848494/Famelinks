const serializeHttpResponse = require('../../../helpers/serialize-http-response');
const blockUnblockService = require('../../../services/v2/users/blockUnblockUser');
const getOneUserService = require('../../../services/v2/users/getOneUser');
const { isValidObjectId } = require('../../../utils/db');

module.exports = async (request) => {
    if (!isValidObjectId(request.params.userId)) {
        return serializeHttpResponse(400, {
            message: 'Invalid userId'
        });
    }

    const user = await getOneUserService(request.params.userId);
    if (!user) {
        return serializeHttpResponse(200, {
            message: 'User not found',
        });
    }
    await blockUnblockService(request.user._id, request.params.userId, false);

    return serializeHttpResponse(200, {
        message: 'Updated',
    });
};
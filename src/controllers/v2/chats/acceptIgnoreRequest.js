const serializeHttpResponse = require('../../../helpers/serialize-http-response');
const acceptIgnoreRequestService = require('../../../services/v2/chats/acceptIgnoreRequest');
const { isValidObjectId } = require('../../../utils/db');

module.exports = async (request) => {
    if (!isValidObjectId(request.params.chatId)) {
        return serializeHttpResponse(400, {
            message: 'Invalid Object Id'
        });
    }
    await acceptIgnoreRequestService(request.params.chatId, request.body.accept, request.user._id);
    return serializeHttpResponse(200, {
        message: request.body.accept ? 'Accepted' : 'Ignored'
    });
};
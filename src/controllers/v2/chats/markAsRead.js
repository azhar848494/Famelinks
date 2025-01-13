const serializeHttpResponse = require('../../../helpers/serialize-http-response');
const markAsReadService = require('../../../services/v2/chats/markAsRead');
const { isValidObjectId } = require('../../../utils/db');

module.exports = async (request) => {
    if (!isValidObjectId(request.params.chatId)) {
        return serializeHttpResponse(400, {
            message: 'Invalid Object Id'
        });
    }
    await markAsReadService(request.params.chatId, request.user._id);
    return serializeHttpResponse(200, {
        message: 'Marked as read'
    });
};
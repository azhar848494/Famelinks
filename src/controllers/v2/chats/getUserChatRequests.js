const serializeHttpResponse = require('../../../helpers/serialize-http-response');
const getUserChatRequestsService = require('../../../services/v2/chats/getUserChatRequests');

module.exports = async (request) => {
    const result = await getUserChatRequestsService(request.user._id, request.query.page, request.user.blockList);
    return serializeHttpResponse(200, {
        message: 'Chats Fetched',
        result
    });
};
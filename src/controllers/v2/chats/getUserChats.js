const serializeHttpResponse = require('../../../helpers/serialize-http-response');
const getUserChatsService = require('../../../services/v2/chats/getUserChats');

module.exports = async (request) => {
    const result = await getUserChatsService(request.user._id, request.query.page, request.user.blockList);
    return serializeHttpResponse(200, {
        message: 'Chats Fetched',
        result
    });
};
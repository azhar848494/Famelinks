const serializeHttpResponse = require('../../../helpers/serialize-http-response');
const getUserChatByIdService = require('../../../services/v3/chats/getUserChatById');
const closeChatService = require('../../../services/v3/chats/closeChat')
const { isValidObjectId } = require('../../../utils/db');

module.exports = async (request) => {
    let chatId = request.params.chatId
    if (!isValidObjectId(chatId)) {
        return serializeHttpResponse(400, {
            message: 'Invalid Chat Id'
        });
    }

    const chat = await getUserChatByIdService(request.user._id, request.params.chatId);
    if (!chat) {
        return serializeHttpResponse(200, {
            message: 'Chat not found',
            result: []
        });
    }

    if (chat.category == 'conversation') {
        return serializeHttpResponse(400, {
            message: 'Cannot close chats other than job chats'
        })
    }

    let result = await closeChatService(chatId)

    if (!result) {
        return serializeHttpResponse(500, {
            message: 'Failed to close the chat'
        })
    }

    return serializeHttpResponse(200, {
        message: 'Chat closed successfuly'
    })
}
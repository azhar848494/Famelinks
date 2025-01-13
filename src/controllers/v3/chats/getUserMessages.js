const serializeHttpResponse = require('../../../helpers/serialize-http-response');
const getUserMessagesService = require('../../../services/v3/chats/getUserMessages');
const getUserChatByIdService = require('../../../services/v3/chats/getUserChatById');
const { isValidObjectId } = require('../../../utils/db');
const getJobDetails = require('../../../services/v3/chats/getJobDetails')

module.exports = async (request) => {
    if (!isValidObjectId(request.params.chatId)) {
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

    let job = []
    if (chat.category) {
        job = await getJobDetails(chat.jobId)
    }

    const result = await getUserMessagesService(request.params.chatId, request.query.page, chat.category);
    return serializeHttpResponse(200, {
        message: 'Chats Fetched',
        result: {
            messages: result,
            readBy: chat.readBy,
            job: job
        }
    });
};
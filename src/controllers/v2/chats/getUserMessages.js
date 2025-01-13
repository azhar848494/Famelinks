const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const getUserMessagesService = require("../../../services/v2/chats/getUserMessages");
const getUserChatByIdService = require("../../../services/v2/chats/getUserChatById");
const { isValidObjectId } = require("../../../utils/db");

module.exports = async (request) => {
  let userId = request.query.userId;
  let selfUserId = request.user._id;
  let page = request.query.page;
  let category = request.query.category;

  if (!isValidObjectId(userId)) {
    return serializeHttpResponse(400, {
      message: "Invalid user Id",
    });
  }

  // const chat = await getUserChatByIdService(request.user._id, request.params.chatId);
  // if (!chat) {
  //     return serializeHttpResponse(200, {
  //         message: 'Chat not found',
  //         result: []
  //     });
  // }

  const result = await getUserMessagesService(userId, selfUserId,category, page);
  return serializeHttpResponse(200, {
    message: "Chats Fetched",
    result,
  });
};

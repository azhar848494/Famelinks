const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const getUserJobChatsService = require("../../../services/v2/chats/getUserJobChats");

module.exports = async (request) => {
  const result = await getUserJobChatsService(
    request.user._id,
    request.query.page,
    request.user.blockList, 
    request.user._id,
  );
  return serializeHttpResponse(200, {
    message: " Job Chats Fetched",
    result,
  });
};

const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const getUserJobChatRequestsService = require("../../../services/v2/chats/getUserJobChatRequests");

module.exports = async (request) => {
  const result = await getUserJobChatRequestsService(
    request.user._id,
    request.query.page,
    request.user.blockList
  );
  return serializeHttpResponse(200, {
    message: "Job Chats Requests Fetched",
    result,
  });
};

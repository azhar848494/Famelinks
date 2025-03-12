const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const getChannelGridService = require("../../../services/v2/channels/getChannelGrid");


module.exports = async (request) => {
  let userId = request.user._id;

  let channelId = request.params.channelId;
  let page = request.query.page;

  const result = await getChannelGridService({ userId, channelId, page });

  if (!result) {
    return serializeHttpResponse(500, {
      message: "Failed to fetch channel posts",
    });
  }
  return serializeHttpResponse(200, {
    message: "Channel grid Fetched",
    result: result[0],
  });
};

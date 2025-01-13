const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const getChannelPostsService = require("../../../services/v2/channels/getChannelPosts");


module.exports = async (request) => {
  let userId = request.user._id;
  let page = request.query.page;


  const result = await getChannelPostsService(userId, page);

 if (!result) {
   return serializeHttpResponse(500, {
     message: "Failed to fetch channel posts",
   });
 }
  return serializeHttpResponse(200, {
    message: "Channel posts Fetched",
    result,
  });
};

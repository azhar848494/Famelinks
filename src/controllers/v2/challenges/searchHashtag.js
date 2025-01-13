const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const searchHashtagService = require("../../../services/v2/challenges/searchHashtag")

module.exports = async (request) => {
  const result = await searchHashtagService(request.params.data);
  return serializeHttpResponse(200, {
    message: "Hashtag Fetched",
    result,
  });
};

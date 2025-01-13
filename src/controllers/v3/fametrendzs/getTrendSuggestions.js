const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const getTrendzSuggestions = require("../../../services/v3/fametrendzs/getTrendSuggestions");
const { isValidObjectId } = require("../../../utils/db");

module.exports = async (request) => {
  let page = request.query.page;
  let userId = request.user._id;

  const result = await getTrendzSuggestions(page, userId);

  if (!result) {
    return serializeHttpResponse(404, {
      message: "Trend Suggestions not found",
      result,
    });
  }
  return serializeHttpResponse(200, {
    message: "Trend Suggestions Fetched",
    result,
  });
};

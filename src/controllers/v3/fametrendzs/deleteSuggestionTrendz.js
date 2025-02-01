const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const deleteSuggestionTrendzService = require("../../../services/v3/fametrendzs/deleteSuggestionTrendz");
const { isValidObjectId } = require("../../../utils/db");
const { getOneSuggestionTrendz } = require("../../../data-access/v3/fametrendzs");

module.exports = async (request) => {
  let selfUserId = request.user._id;

  if (!isValidObjectId(request.params.trendzId)) {
    return serializeHttpResponse(400, {
      message: "Invalid Trendz Id",
    });
  }

  const Trendz = await getOneSuggestionTrendz(request.params.trendzId);

  if (!Trendz) {
    return serializeHttpResponse(400, {
      message: "Trendz not found",
    });
  }

  if (Trendz.userId.toString() !== selfUserId.toString()) {
    return serializeHttpResponse(403, {
      message: "Permission Denied",
    });
  }

  await deleteSuggestionTrendzService(request.params.trendzId);

  return serializeHttpResponse(200, {
    message: "Suggestion deleted",
  });
};

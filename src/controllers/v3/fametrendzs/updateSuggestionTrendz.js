const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const updateSuggestionTrendz = require("../../../services/v3/fametrendzs/updateSuggestionTrendz");
const { isValidObjectId } = require("../../../utils/db");
const { getOneSuggestionTrendz } = require("../../../data-access/v3/fametrendzs");


module.exports = async (request) => {
  let payload = request.body;
  let selfUserId = request.user._id;
  payload.userId = selfUserId;

  payload.gender = JSON.parse(payload.gender);
  payload.age = JSON.parse(payload.age);
  payload.type = JSON.parse(payload.type);

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
  
  if (!isValidObjectId(request.body.userId)) {
    return serializeHttpResponse(400, {
      message: "Invalid userId",
    });
  }
  let result = await updateSuggestionTrendz(request.params.trendzId, payload);

  if (!result) {
    return serializeHttpResponse(500, {
      message: "Failed to add fametrendz suggestion",
    });
  }

  return serializeHttpResponse(200, {
    message: "fametrendz suggestion updated successfuly",
    result,
  });
};

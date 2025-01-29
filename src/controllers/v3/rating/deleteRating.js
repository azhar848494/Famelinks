const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const removeRatingService = require("../../../services/v3/rating/removeRating");
const { getMyRating } = require("../../../data-access/v3/rating");
const { isValidObjectId } = require("../../../utils/db");

module.exports = async (request) => {
  let userId = request.user._id;
  let trendId = request.params.trendId;

  if (!isValidObjectId(trendId)) {
    return serializeHttpResponse(400, {
      message: "valid trendId is required",
    });
  }

  const rating = await getMyRating(trendId, userId);

  if (!rating) {
    return serializeHttpResponse(400, {
      message: "rating not found",
    });
  }

  if (rating.userId.toString() != userId.toString()) {
    return serializeHttpResponse(400, {
      message: "Permission Denied",
    });
  }

  let result = await removeRatingService(rating._id);

  if (!result) {
    return serializeHttpResponse(500, {
      message: "faild to remove rating",
    });
  }

  return serializeHttpResponse(200, {
    message: "rating removed successfully",
    result,
  });
};

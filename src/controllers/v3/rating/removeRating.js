const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const removeRatingService = require("../../../services/v3/rating/removeRating");
const { getRating } = require("../../../data-access/v3/rating");
const { isValidObjectId } = require("../../../utils/db");

module.exports = async (request) => {
  let userId = request.user._id;
  let ratingId = request.params._id;

  if (!isValidObjectId(request.params._id)) {
    return serializeHttpResponse(400, {
      message: "valid ratingId is required",
    });
  }

  const rating = await getRating(ratingId);

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

  let result = await removeRatingService(ratingId);

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

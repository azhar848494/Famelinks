const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const ratingService = require("../../../services/v3/rating/addRating");
const { getOneFametrendz } = require("../../../data-access/v3/fametrendzs");
const { getMyRating } = require("../../../data-access/v3/rating")
const { isValidObjectId } = require("../../../utils/db");

module.exports = async (request) => {
  let userId = request.user._id;
  let trendId = request.body.trendId;
  let rating = request.body.rating;



  if (!isValidObjectId(trendId)) {
    return serializeHttpResponse(400, {
      message: "Invalid trendId",
    });
  }

  const fametrendzs = await getOneFametrendz(trendId);

  if (!fametrendzs) {
    return serializeHttpResponse(400, {
      message: "trend not found",
    });
  }

  // if (rating > 0) {
    let data = await ratingService.addRating(userId, trendId, rating);
    if (!data) {
      return serializeHttpResponse(500, {
        message: "faild to add rating",
      });
    }

    let result = await getMyRating(trendId, userId);
  
    if (!result) {
      return serializeHttpResponse(500, {
        message: "rating not found",
      });
    }

    return serializeHttpResponse(200, {
      message: "rating added successfully",
      result,
    });
  // } else {
  //   let data = await ratingService.deleteRating(userId, trendId);
  //   if (!data) {
  //     return serializeHttpResponse(500, {
  //       message: "faild to delete rating",
  //     });
  //   }

  //   return serializeHttpResponse(200, {
  //     message: "rating deleted successfully",
  //   });
  // }
};

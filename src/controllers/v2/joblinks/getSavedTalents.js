const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const getSavedTalentsService = require("../../../services/v2/joblinks/getSavedTalents");
const { isValidObjectId } = require("../../../utils/db");

module.exports = async (request) => {
  let userId = request.user._id;
  let page = request.query.page || 1

  let result = await getSavedTalentsService({ page, userId });

  if (!result) {
    return serializeHttpResponse(500, {
      message: "Failed to fetch Saved Talents",
    });
  }

  result = result[0].savedTalents;

  return serializeHttpResponse(200, {
    message: "Saved Talents fetched succesfuly",
    result,
  });
};

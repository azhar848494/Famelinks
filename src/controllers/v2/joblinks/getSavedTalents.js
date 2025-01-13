const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const getSavedTalentsService = require("../../../services/v2/joblinks/getSavedTalents");
const { isValidObjectId } = require("../../../utils/db");

module.exports = async (request) => {
  let page = request.query.page;
  let joblinksId = request.user._id;
  let masterId = request.user._id;

  let result = await getSavedTalentsService(page, joblinksId, masterId);
  result = result[0].savedTalents;

  if (!result) {
    return serializeHttpResponse(500, {
      message: "Failed to fetch Saved Talents",
    });
  }

  return serializeHttpResponse(200, {
    message: "Saved Talents fetched succesfuly",
    result,
  });
};

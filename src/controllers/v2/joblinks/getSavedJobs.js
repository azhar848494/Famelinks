const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const getSavedJobsService = require("../../../services/v2/joblinks/getSavedJobs");
const { isValidObjectId } = require("../../../utils/db");

module.exports = async (request) => {
  let page = request.query.page;
  let joblinksId = request.user._id;
  let masterId = request.user._id;

  let result = await getSavedJobsService(page, joblinksId, masterId);
  result = result[0].savedJobs;

  if (!result) {
    return serializeHttpResponse(500, {
      message: "Failed to fetch Saved jobs",
    });
  }

  return serializeHttpResponse(200, {
    message: "Saved jobs fetched succesfuly",
    result,
  });
};

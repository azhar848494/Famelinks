const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const getShortlistedJobsService = require("../../../services/v2/joblinks/getShortlistedJobs");
const { isValidObjectId } = require("../../../utils/db");

module.exports = async (request) => {
  let page = request.query.page;
  let joblinksId = request.user._id;
  let masterId = request.user._id;

  let result = await getShortlistedJobsService(page, joblinksId, masterId);
  result = result[0].shortlisted;

  if (!result) {
    return serializeHttpResponse(500, {
      message: "Failed to fetch Shortlisted jobs",
    });
  }

  return serializeHttpResponse(200, {
    message: "Shortlisted jobs fetched succesfuly",
    result,
  });
};

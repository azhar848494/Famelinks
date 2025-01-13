const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const getHiredJobsService = require("../../../services/v2/joblinks/getHiredJobs");
const { isValidObjectId } = require("../../../utils/db");

module.exports = async (request) => {
  let page = request.query.page;
  let joblinksId = request.user._id;
  let masterId = request.user._id;

  let result = await getHiredJobsService(page, joblinksId, masterId);
  result = result[0].hired;

  if (!result) {
    return serializeHttpResponse(500, {
      message: "Failed to fetch Hired jobs",
    });
  }

  return serializeHttpResponse(200, {
    message: "Hired jobs fetched succesfuly",
    result,
  });
};

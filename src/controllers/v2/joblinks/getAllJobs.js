const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const getAllJobsService = require("../../../services/v2/joblinks/getAllJobs");

module.exports = async (request) => {
  let page = request.query.page;
  let joblinksId = request.user._id;
  let masterId = request.user._id;


  let result = await getAllJobsService(page, joblinksId, masterId);

  if (!result) {
    return serializeHttpResponse(500, {
      message: "Failed to fetch Applied jobs",
    });
  }
  
  result = result[0].applied;

  return serializeHttpResponse(200, {
    message: "Applied jobs fetched succesfuly",
    result,
  });
};

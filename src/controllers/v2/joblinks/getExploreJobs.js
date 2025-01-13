const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const getJobsService = require("../../../services/v2/joblinks/getJobs");


module.exports = async (request) => {
  let page = request.query.page;
  let joblinksId = request.user._id;
  let userType = request.user.type;

  let result = await getJobsService(joblinksId, userType, page);

  if (!result) {
    return serializeHttpResponse(500, {
      message: "Failed to Explore Jobs",
    });
  }

  return serializeHttpResponse(200, {
    message: "Explore Jobs fetched succesfuly",
    result,
  });
};

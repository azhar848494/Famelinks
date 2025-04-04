const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const getJobs = require("../../../services/v2/joblinks/createdJobs");

module.exports = async (request) => {
  const userId = request.user._id
 
  const type = request.params.type
  const page = request.query.page

  let result = await getJobs({ userId, type, page });

  if (!result) {
    return serializeHttpResponse(500, {
      message: "Failed to get jobs",
    });
  }

  return serializeHttpResponse(200, {
    message: "Jobs fetched succesfuly",
    result,
  });
};

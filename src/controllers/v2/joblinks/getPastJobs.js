const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const getClosedJobs = require("../../../services/v2/joblinks/getClosedJobs");
const { isValidObjectId } = require("../../../utils/db");

module.exports = async (request) => {
  let page = request.query.page;
  let joblinksId = request.user._id;

  let closedJobsFaces = await getClosedJobs(joblinksId, page, "faces");
  let closedJobsCrew = await getClosedJobs(joblinksId, page, "crew");
  let result = closedJobsFaces.concat(closedJobsCrew);

  if (!result) {
    return serializeHttpResponse(500, {
      message: "Failed to fetch Past jobs",
    });
  }

  return serializeHttpResponse(200, {
    message: "Past jobs fetched succesfuly",
    result,
  });
};

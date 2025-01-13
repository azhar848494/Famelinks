const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const getOpenJobs = require("../../../services/v2/joblinks/getOpenJobs.js");


module.exports = async (request) => {
  let page = request.query.page;
  let joblinksId = request.user._id;


  let openJobsFaces = await getOpenJobs(joblinksId, page, "faces");
  let openJobsCrew = await getOpenJobs(joblinksId, page, "crew");
  let result = openJobsFaces.concat(openJobsCrew);

  if (!result) {
    return serializeHttpResponse(500, {
      message: "Failed to Your Open jobs",
    });
  }

  return serializeHttpResponse(200, {
    message: "Your Open jobs fetched succesfuly",
    result,
  });
};

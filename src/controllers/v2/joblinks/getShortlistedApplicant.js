const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const { isValidObjectId } = require("../../../utils/db");
const checkJob = require("../../../services/v2/joblinks/checkJob");
const getShortlistedApplicant = require("../../../services/v2/joblinks/getShortlistedApplicant");

module.exports = async (request) => {
  let jobId = request.params.jobId;
  let page = request.query.page;


  if (!isValidObjectId(jobId)) {
    return serializeHttpResponse(400, {
      message: "Invalid job Id",
    });
  }

  let job = await checkJob(jobId);

  if (job && job.length == 0) {
    return serializeHttpResponse(400, {
      message: "Job does not exists",
    });
  }

  let result = await getShortlistedApplicant(
    request.user._id,
    jobId,
    job[0].jobType,
    page
  );

  if (!result) {
    return serializeHttpResponse(500, {
      message: "Failed to fetch shortlisted job applicants",
    });
  }


  return serializeHttpResponse(200, {
    message: "shortlisted Job applicants fetched successfuly",
    result,
  });
};
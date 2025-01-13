const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const checkJob = require("../../../services/v2/joblinks/checkJob");
const getSortedApplicants = require("../../../services/v2/joblinks/getSortedApplicant");
const updateJob = require("../../../services/v2/joblinks/updateJob");

module.exports = async (request) => {
  let jobId = request.params.jobId;
  let page = request.query.page;
  let sort = request.params.sort;

  const { isValidObjectId } = require("../../../utils/db");

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

  let result = await getSortedApplicants(
    request.user._id,
    jobId,
    job[0].jobType,
    page,
    sort
  );

  if (!result) {
    return serializeHttpResponse(500, {
      message: "Failed to fetch job applicants",
    });
  }

  let currentDate = new Date();
  await updateJob(jobId, { lastVisited: currentDate });

  return serializeHttpResponse(200, {
    message: "Job applicants fetched successfuly",
    result,
  });
};

const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const checkJob = require("../../../services/v2/joblinks/checkJob");
const getApplicantsBySearch = require("../../../services/v2/joblinks/getApplicantBySearch");
const updateJob = require("../../../services/v2/joblinks/updateJob");

module.exports = async (request) => {
  let jobId = request.params.jobId;
  let name = request.query.name;
  let age = request.query.age;
  let gender = request.query.gender;
  let complexion = request.query.complexion;
  let eyeColor = request.query.eyeColor;
  let weight = request.query.weight;
  let height = request.query.height;
  let bust = request.query.bust;
  let waist = request.query.waist;
  let hip = request.query.hip;
  let experienceLevel = request.query.experienceLevel;
  let page = request.query.page;
  
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

  let result = await getApplicantsBySearch(
    request.user._id,
    jobId,
    job[0].jobType,
    name,
    age,
    gender,
    complexion,
    eyeColor,
    weight,
    height,
    bust,
    waist, 
    hip,
    experienceLevel,
    page
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

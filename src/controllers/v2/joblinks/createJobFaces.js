const serializeHttpResponse = require('../../../helpers/serialize-http-response');
const createJob = require("../../../services/v2/joblinks/createJob")
const { getJobByData } = require("../../../data-access/v2/joblinks")

module.exports = async (request) => {

  // if (request.user.type == "individual") {
  //   return serializeHttpResponse(400, {
  //     message:
  //       "User cannot create a job. Only brand or agency can create a job",
  //   });
  // }

  let result;
  let payload = request.body;

  payload.createdBy = request.user._id;

  payload.lastVisited = new Date()

  let job = await getJobByData(payload);
  if(job != null){    
    return serializeHttpResponse(500, {
      message: "Same job already created",
    });
  }

  result = await createJob(payload);

  if (!result) {
    return serializeHttpResponse(500, {
      message: "Failed to create job",
    });
  }

  //Match with users' hiring profile and send notifications to those users

  return serializeHttpResponse(200, {
    message: payload.status == 'draft' ? "Job saved successfully" : "Job created successfully",
    result,
  });
}
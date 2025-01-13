const serializeHttpResponse = require('../../../helpers/serialize-http-response');
const checkApplication = require('../../../services/v2/joblinks/checkApplication');
const hireServices = require('../../../services/v2/joblinks/hire')
const { isValidObjectId } = require('../../../utils/db');
const sendNotificationsService = require("../../../services/v2/users/sendNotifications");
const { getOneUser } = require("../../../data-access/v2/users");


module.exports = async (request) => {
  // if (request.user.type == "individual") {
  //   return serializeHttpResponse(400, {
  //     message: "User cannot hire another user for any job",
  //   });
  // }

  let jobId = request.body.jobId;
  let userId = request.body.userId;
  let closeJob = request.body.closeJob;

  const user = await getOneUser(userId);

  if (!isValidObjectId(jobId)) {
    return serializeHttpResponse(400, {
      message: "Invalid job Id",
    });
  }

  if (!isValidObjectId(userId)) {
    return serializeHttpResponse(400, {
      message: "Invalid applicant Id",
    });
  }

  let application = await checkApplication(jobId, userId);

  if (!application) {
    return serializeHttpResponse(400, {
      message: "No job application found by this user for this job",
      result: application,
    });
  }

  if (application) {
    if (application.status == "hired") {
      return serializeHttpResponse(400, {
        message: "Applicant has been already hired for this job",
      });
    }

    if (application.status == "withdrew") {
      return serializeHttpResponse(400, {
        message: "Applicant has withdrawn his application for this job",
      });
    }
  }

  let result = await hireServices(jobId, userId, closeJob);

  if (!result) {
    return serializeHttpResponse(500, {
      message: "Failed to hire the applicant",
      result,
    });
  }

  if(request.user.pushToken){
    await sendNotificationsService(
      "jobSelection",
      {
        sourceName: request.user.name,
        sourceId: request.user._id,
        sourceMedia: request.user.profileImage,
        sourceType: request.user.type,
      },
      null,
      {
        targetId: user._id,
        pushToken: user.pushToken,
        category: "jobs_offers",
        // count: user.commentsCount,
        userId: request.user._id,
        targetMedia: user.profileImage,
      },
      true,
      true
    );
  }

  //Send notofication to user that he/she has been selected by the job creator

  return serializeHttpResponse(200, {
    message: "Applicant hired successfuly",
    result,
  });
}
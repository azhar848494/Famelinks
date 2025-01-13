const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const applyJob = require("../../../services/v2/joblinks/applyJob");
const checkJob = require("../../../services/v2/joblinks/checkJob");
const checkApplication = require("../../../services/v2/joblinks/checkApplication");
const sendNotificationsService = require("../../../services/v2/users/sendNotifications");
const { isValidObjectId } = require("../../../utils/db");
const getMasterProfile = require("../../../services/v2/users/getMasterProfile");
const { getOneUser,getHiringProfile } = require("../../../data-access/v2/users");


module.exports = async (request) => {
  if (request.user.type == "brand") {
    return serializeHttpResponse(400, {
      message: "Operation denied. Brand cannot apply any job",
    });
  }

  let jobId = request.params.jobId;
  let result, childProfileId;

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

  const masterId = job[0].createdBy[0]._id
  const user = await getOneUser(masterId)

  if (masterId.toString() == request.user._id.toString()) {
    return serializeHttpResponse(400, {
      message: 'User cannot apply to the job created by himself/herself'
    })
  }

  let jobType = job[0].jobType;

  let hiringProfile = await getHiringProfile(request.user._id, jobType)

  if (!hiringProfile) {
    return serializeHttpResponse(400, {
      message: `${jobType} profile not found`
    });
  }

  if (request.user.type == "agency" && jobType == "faces") {
    return serializeHttpResponse(400, {
      message: "Operation denied. Agency cannot apply to front faces jobs",
    });
  }

  childProfileId = request.user._id;

  if (!childProfileId) {
    return serializeHttpResponse(500, {
      message: "Failed to fetch child profile of the user",
    });
  }

  let application = await checkApplication(jobId, childProfileId);

  if (application) {
    if (application.status == "applied") {
      return serializeHttpResponse(400, {
        message: "Job already applied",
      });
    }

    if (application.status == "shortlisted") {
      return serializeHttpResponse(400, {
        message: "Cannot apply to this job. You have been already shortlisted",
      });
    }

    if (application.status == "hired") {
      return serializeHttpResponse(200, {
        message: "You have already been hired for this job.",
        result,
      });
    }
  }

  result = await applyJob(childProfileId, jobId, jobType);

  if (!result) {
    return serializeHttpResponse(500, {
      message: "Failed to apply job",
    });
  }

  //Send notification to job creator indicating someone has applied to their job
  if (request.user.pushToken) {
    await sendNotificationsService(
      "jobApplication",
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
        userId: user._id,
        targetMedia: user.profileImage,
      },
      true,
      true
    );
  }

  return serializeHttpResponse(200, {
    message: "Job applied successfuly",
    result,
  });
};

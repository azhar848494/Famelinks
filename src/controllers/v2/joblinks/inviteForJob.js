const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const inviteForJob = require("../../../services/v2/joblinks/inviteForJob");
const { checkInvitation } = require("../../../data-access/v2/users");
const { isValidObjectId } = require("../../../utils/db");
const sendNotificationsService = require("../../../services/v2/users/sendNotifications");
const {
  getOneUser,
  getHiringProfile,
} = require("../../../data-access/v2/users");
const { getJob } = require("../../../data-access/v2/joblinks");

module.exports = async (request) => {
  let userId = request.params.userId;
  let action = request.params.action;
  let jobId = request.query.jobId;
  let jobType = request.query.jobType;
  let masterId;

  if (!isValidObjectId(userId)) {
    return serializeHttpResponse(400, {
      message: "Invalid user Id",
    });
  }

  if (!isValidObjectId(jobId)) {
    return serializeHttpResponse(400, {
      message: "Invalid job Id",
    });
  }

  const job = await getJob(jobId);

  if (!job) {
    return serializeHttpResponse(400, {
      message: "job not found",
    });
  }

  //MasterIdMigration
  if (request.user._id.toString() != job.createdBy.toString()) {
    return serializeHttpResponse(400, {
      message: "permission denied! only creator can send invitation",
    });
  }

  const hiringprofile = await getHiringProfile(userId, jobType);

  if (!hiringprofile) {
    return serializeHttpResponse(400, {
      message: `user ${jobType} profile not found`,
    });
  }

  if (hiringprofile) {
    masterId = hiringprofile.userId;
  }
  
  const user = await getOneUser(masterId);
  let invitation = await checkInvitation(
    jobId,
    userId,
    request.user._id,
    "job",
    jobType
  );

  if (invitation && action == "send") {
    return serializeHttpResponse(400, {
      message: "User already invited for this job",
    });
  }

  let result = await inviteForJob(
    jobId,
    userId,
    request.user._id,
    action,
    jobType
  );

  if (!result) {
    let message =
      action == "send"
        ? "Failed to send invitation"
        : "Failed to withdraw invitation";
    return serializeHttpResponse(500, {
      message,
    });
  }
  if (result) {
    if (request.user.pushToken) {
      await sendNotificationsService(
        "jobInvitation",
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
  }

  //if(action == 'send')
  //Send notofication to user indicating job creator has invited you to visit their profile for jobs

  let message =
    action == "send"
      ? "Invite sent successfuly"
      : "Invite withdrawn successfuly";
  return serializeHttpResponse(200, {
    message,
  });
};

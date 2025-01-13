const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const acceptRejectJobInvite = require("../../../services/v2/joblinks/acceptRejectJobInvite");
const { checkInvitation } = require("../../../data-access/v2/users");
const { isValidObjectId } = require("../../../utils/db");
const { getJob, deleteInvite } = require("../../../data-access/v2/joblinks");

module.exports = async (request) => {
  let action = request.params.action;
  let jobId = request.query.jobId;
  let jobType = request.query.jobType;
  let toId = request.user._id;

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

  let invitation = await checkInvitation(
    jobId,
    toId,
    job.createdBy,
    "job",
    jobType
  )

  if (!invitation) {
    return serializeHttpResponse(400, {
      message: "Invitation not found  for this job",
    });
  }

  let result = await acceptRejectJobInvite(
    jobId,
    toId,
    job.createdBy,
    action,
    jobType
  );

  if(result && action == "accept"){
    await deleteInvite(jobId, toId, job.createdBy, jobType);
  }

  if (!result) {
    let message =
      action == "accept"
        ? "Failed to accept invitation"
        : "Failed to reject invitation";
    return serializeHttpResponse(500, {
      message,
    });
  }
  
  let message =
    action == "accept"
      ? "Invite accepted successfuly"
      : "Invite rejected successfuly";
  return serializeHttpResponse(200, {
    message,
  });
};

const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const { isValidObjectId } = require("../../../utils/db");
const shortlistServices = require("../../../services/v2/joblinks/shortlist");
const checkApplication = require("../../../services/v2/joblinks/checkApplication");
const checkJob = require("../../../services/v2/joblinks/checkJob");
const sendNotificationsService = require("../../../services/v2/users/sendNotifications");
const getMasterProfile = require("../../../services/v2/users/getMasterProfile");
const { getOneUser } = require("../../../data-access/v2/users");

module.exports = async (request) => {
  // if (request.user.type == "individual") {
  //   return serializeHttpResponse(400, {
  //     message: "User cannot shortlist another user for any job",
  //   });
  // }

  let jobId = request.body.jobId;
  let userId = request.body.userId;
  let shortlist = request.body.shortlist;

  const masterId = await getMasterProfile(userId);
  const user = await getOneUser(masterId[0]._id)

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

    if (application.status == "shortlisted" && shortlist) {
      return serializeHttpResponse(400, {
        message: "Applicant has been already shortlisted for this job",
      });
    }
  }

  let result = await shortlistServices(jobId, userId, shortlist);

  if (!result) {
    let message =
      shortlist == true
        ? "Failed to shortlist the applicant"
        : "Failed to remove applicant from shortlist";
    return serializeHttpResponse(500, {
      message,
      result,
    });
  }

  //Send notofication to user that he/she has been shortlisted by the job creator

    //if (shortlist == true)
    //Send notofication to user that he/she has been shortlisted by the job creator

  let message =
    shortlist == true
      ? "Applicant shortlisted successfuly"
      : "Applicant removed from shortlist successfuly";

  if (request.body.shortlist == true) {
    if (request.user.pushToken) {
      await sendNotificationsService(
        "jobShortlist",
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
  return serializeHttpResponse(200, {
    message,
    result,
  });
};

// Create notification

const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const getAppliedJobsService = require("../../../services/v2/joblinks/getAppliedJobs");
const { isValidObjectId } = require("../../../utils/db");

module.exports = async (request) => {
  let page = request.query.page;
  let joblinksId = request.user._id;
  let masterId = request.user._id;


  let result = await getAppliedJobsService(page, joblinksId, masterId);
  result = result[0].applied;

  if (!result) {
    return serializeHttpResponse(500, {
      message: "Failed to fetch Applied jobs",
    });
  }

  return serializeHttpResponse(200, {
    message: "Applied jobs fetched succesfuly",
    result,
  //   result: {
  //     // data: result[0].applied,
  //     hiringprofiles: result[0].hiringprofiles,
  //     invitesCount: result[0].invitesCount,
  // },
  });
};

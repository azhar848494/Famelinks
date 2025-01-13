const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const getMyOpenJobsService = require("../../../services/v2/joblinks/getMyOpenJobs");
const { isValidObjectId } = require("../../../utils/db");

module.exports = async (request) => {
  let page = request.query.page;
  let joblinksId = request.user._id;
  let userId = request.query.userId
  let masterId = request.user._id;
  let type = request.query.type;

  let typeObj = {};

  if(type != null && type !== ""){
    typeObj.$expr = { $eq: ["$jobType", type] };
  }

  let result = await getMyOpenJobsService(joblinksId, page, userId, typeObj);

  if (!result) {
    return serializeHttpResponse(500, {
      message: "Failed to fetch Open jobs",
    });
  }

  return serializeHttpResponse(200, {
    message: "Open jobs fetched succesfuly",
    result,
  });
};

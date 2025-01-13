const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const getJobInvitesService = require("../../../services/v2/joblinks/getJobInvites");
const { isValidObjectId } = require("../../../utils/db");

module.exports = async (request) => {
  let page = request.query.page;
  let joblinksId = request.user._id;
  let masterId = request.user._id;

  let result = await getJobInvitesService(page, joblinksId, masterId);
  
  if(result.length > 0){
  result[0].invitesCount = result.length
  }

  if (!result) {
    return serializeHttpResponse(500, {
      message: "Failed to fetch Job invites",
    });
  }

  return serializeHttpResponse(200, {
    message: "Job invites fetched succesfully",
    result,
  });
};

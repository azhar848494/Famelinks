const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const searchAgencyService = require("../../../services/v2/users/searchAgency");

module.exports = async (request) => {
 let userId = request.user._id;

  const result = await searchAgencyService(request.params.data, userId);
  return serializeHttpResponse(200, {
    message: "agency Fetched",
    result,
  });
};

// Create notification -> Notify brands stating users are trying to tag their products but have insufficient famecoins

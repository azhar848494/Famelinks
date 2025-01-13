const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const searchTagsService = require("../../../services/v2/users/searchTags");

module.exports = async (request) => {
  let challenges = []
  if (request.body.challenges) {
    challenges = request.body.challenges
  }

  const result = await searchTagsService(request.params.data, challenges);
  return serializeHttpResponse(200, {
    message: "tags Fetched",
    result,
  });
};

// Create notification -> Notify brands stating users are trying to tag their products but have insufficient famecoins
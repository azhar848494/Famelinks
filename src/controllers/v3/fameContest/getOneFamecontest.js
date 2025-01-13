const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const getOneChallengeService = require("../../../services/v2/challenges/getOneChallenge");
const { isValidObjectId } = require("../../../utils/db");

module.exports = async (request) => {
  let userId = request.user._id;

  if (!isValidObjectId(request.params.challengeId)) {
    return serializeHttpResponse(400, {
      message: "Invalid Object Id",
    });
  }
  const result = await getOneChallengeService(
    request.params.challengeId,
    userId
  );
  if (!result) {
    return serializeHttpResponse(404, {
      message: "Challenge not found",
      result,
    });
  }
  return serializeHttpResponse(200, {
    message: "Challenge Fetched",
    result,
  });
};

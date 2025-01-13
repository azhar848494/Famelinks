const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const updateImpressionsService = require('../../../services/v2/challenges/updateImpressions');
const getOneChallengeService = require('../../../services/v2/challenges/getOneChallenge');
const { isValidObjectId } = require("../../../utils/db");

module.exports = async (request) => {
    if (!isValidObjectId(request.params.challengeId)) {
      return serializeHttpResponse(400, {
        message: "Invalid Object Id",
      });
    }
  
    // TODO: 6234a2979f94eef8103fac6e check for this challenge id
    const challenge = await getOneChallengeService(request.params.challengeId);
    if (!challenge) {
      return serializeHttpResponse(404, {
        message: "Challenge not found",
        result,
      });
    }
  
    const result = await updateImpressionsService(
      request.params.challengeId,
      request.body.impressions
    );
    return serializeHttpResponse(200, {
      message: "Impressions Updated",
      result,
    });
  };
  
const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const searchChallengeService = require('../../../services/v2/challenges/searchChallenge');

module.exports = async (request) => {
    let linkType = request.params.linkType
    const result = await searchChallengeService(request.params.data, linkType);
    return serializeHttpResponse(200, {
        message: 'Challenges Fetched',
        result
    });
};
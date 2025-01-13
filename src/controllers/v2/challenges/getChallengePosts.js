const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const getChallengePostsService = require('../../../services/v2/challenges/getChallengePosts');
const getOneChallengeService = require('../../../services/v2/challenges/getOneChallenge');
const { isValidObjectId } = require("../../../utils/db");

module.exports = async (request) => {
    if (!isValidObjectId(request.params.challengeId)) {
        return serializeHttpResponse(400, {
            message: 'Invalid Object Id'
        });
    }

    const challenge = await getOneChallengeService(request.params.challengeId);
    if (!challenge) {
        return serializeHttpResponse(404, {
            message: 'Challenge not found',
        });
    }

    const result = await getChallengePostsService(request.params.challengeId, request.params.type, request.query.page, request.user._id, request.user.type);

    if (!result) {
        return serializeHttpResponse(500, {
            message: 'Failed to fetch Challenge posts',
        });
    }

    return serializeHttpResponse(200, {
        message: 'Challenge Posts Fetched',
        result: {
            "content": challenge[0],
            "data": result
        }
    });
};
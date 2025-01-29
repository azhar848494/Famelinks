const serializeHttpResponse = require("../../../helpers/serialize-http-response")
const getChallengeDetails = require('../../../services/v2/challenges/getChallengeDetails')
const { isValidObjectId } = require("../../../utils/db")

module.exports = async (request) => {
    const userId = request.user._id

    const challengeId = request.params.challengeId
    const type = request.params.type

    const page = request.query.page

    try {
        if (!isValidObjectId(challengeId)) {
            return serializeHttpResponse(400, {
                message: 'Invalid ChallengeId'
            });
        }

        const result = await getChallengeDetails({ userId, type, challengeId, page })

        return serializeHttpResponse(200, {
            result: result[0],
            message: 'Challenge Posts Fetched',
        });
    } catch (error) {
        return serializeHttpResponse(500, {
            message: error.message,
        });
    }
};
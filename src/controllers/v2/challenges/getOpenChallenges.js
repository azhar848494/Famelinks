const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const getChallengesService = require('../../../services/v2/challenges/getChallenges');

module.exports = async (request) => {
    const result = await getChallengesService('open', request.query.page, request.query.search, request.params.type);
    return serializeHttpResponse(200, {
        message: 'Challenges Fetched',
        result
    });
};
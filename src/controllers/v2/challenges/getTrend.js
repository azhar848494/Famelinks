const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const getTrendService = require('../../../services/v2/challenges/getTrend');

module.exports = async (request) => {
    const userId = request.user._id
    const page = request.query.page
    const sponsorId = request.query.sponsorId

    let result = await getTrendService({ page, userId, sponsorId });

    return serializeHttpResponse(200, {
        message: 'Trendz Fetched',
        result: result[0]
    });
};
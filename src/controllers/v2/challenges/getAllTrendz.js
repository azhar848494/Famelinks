const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const getAllTrendzService = require('../../../services/v2/challenges/getAllTrendz');

module.exports = async (request) => {
    
    const result = await getAllTrendzService(
      request.query.page,
      request.user._id,
      request.query.sponsorId,
    );

    return serializeHttpResponse(200, {
        message: 'Challenges Fetched',
        result
    });
};
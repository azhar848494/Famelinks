const serializeHttpResponse = require('../../../helpers/serialize-http-response');
const getWinnersService = require('../../../services/v2/challenges/getWinners');

module.exports = async (request) => {
    //MasterIdMigration
    
    const result = await getWinnersService(request.query.page, request.user._id, request.user._id);
    return serializeHttpResponse(200, {
        message: 'Challenge Winners Fetched',
        result
    });
};

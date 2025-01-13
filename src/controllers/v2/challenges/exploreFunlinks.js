const serializeHttpResponse = require('../../../helpers/serialize-http-response');
const exploreFunlinksService = require('../../../services/v2/challenges/exploreFunlinks');

module.exports = async (request) => {
    //MasterIdMigration
    const result = await exploreFunlinksService(request.user._id, request.query.page, request.user._id);
    return serializeHttpResponse(200, {
        message: 'Funlinks Fetched',
        result
    });
};
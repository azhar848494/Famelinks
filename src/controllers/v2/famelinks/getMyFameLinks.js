const serializeHttpResponse = require('../../../helpers/serialize-http-response');
const getMyFameLinksService = require('../../../services/v2/famelinks/getMyFameLinks');

module.exports = async (request) => {    
  //MasterIdMigration
    const result = await getMyFameLinksService(request.user._id, request.query.page, request.user._id);

    if (!result) {
        return serializeHttpResponse(500, {
            message: 'Failed to fetch FameLinks',
            result
        });
    }

    return serializeHttpResponse(200, {
        message: 'FameLinks Fetched',
        result
    });
    //--------------------------v2--------------------------//
};
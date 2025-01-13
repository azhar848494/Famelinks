const serializeHttpResponse = require('../../../helpers/serialize-http-response');
const getHallOfFameService = require('../../../services/v2/users/getHallOfFame');

module.exports = async (request) => {
    const result = await getHallOfFameService(request);

    return serializeHttpResponse(200, {
        message: 'FameLinks Fetched',
        result
    });
};
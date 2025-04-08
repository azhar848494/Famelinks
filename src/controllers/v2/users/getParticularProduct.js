const serializeHttpResponse = require('../../../helpers/serialize-http-response');
const getParticularProductService = require('../../../services/v2/users/getParticularProduct');
const { isValidObjectId } = require('../../../utils/db');

module.exports = async (request) => {
    if (!isValidObjectId(request.params.userId)) {
        return serializeHttpResponse(400, {
            message: 'Invalid Object Id'
        });
    }
    
    const result = await getParticularProductService(
        request.params.userId,
        request.query.page,
        request.user._id,
    );

    return serializeHttpResponse(200, {
        message: 'Products Fetched',
        result
    });
};
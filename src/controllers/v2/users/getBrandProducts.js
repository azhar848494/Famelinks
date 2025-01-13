const serializeHttpResponse = require('../../../helpers/serialize-http-response');
const getBrandProductsService = require('../../../services/v2/users/getBrandProducts');

module.exports = async (request) => {
    const result = await getBrandProductsService(request.params.brandId, request.query.page);
    return serializeHttpResponse(200, {
        message: 'Brand Product Fetched',
        result
    });
};
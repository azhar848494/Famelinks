const serializeHttpResponse = require('../../../helpers/serialize-http-response')
const saveProductService = require('../../../services/v2/users/saveProduct')
const { isValidObjectId } = require('../../../utils/db');

module.exports = async (request) => {
    let productId = request.params.productId

    if (!isValidObjectId(productId)) {
        return serializeHttpResponse(400, {
            message: 'Invalid Object Id'
        });
    }

    let result = await saveProductService(request.user._id, productId)

    if (!result) {
        return serializeHttpResponse(500, {
            message: 'Failed to save selected product'
        })
    }

    return serializeHttpResponse(200, {
        message: 'Product saved successfuly'
    })
}
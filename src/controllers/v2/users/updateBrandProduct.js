const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const updateBrandProductService = require("../../../services/v2/users/updateBrandProduct");
const { isValidObjectId } = require("../../../utils/db");
const BrandProductDB = require("../../../models/v2/brandProducts");

module.exports = async (request) => {
    if (!isValidObjectId(request.params.brandId)) {
        return serializeHttpResponse(400, {
            message: 'Invalid Object Id'
        });
    }

    const onePost = await BrandProductDB.findOne({ _id: request.params.brandId }).lean();
    if (!onePost) {
        return serializeHttpResponse(404, {
            message: 'Brand Product Not Found'
        });
    }

    let result = await updateBrandProductService(request.params.brandId, request.body);
    
    return serializeHttpResponse(200, {
        message: 'Brand Product Updated'
    });
};
const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const deleteProductService = require("../../../services/v2/users/deleteProductService");
const getOneProductService = require("../../../services/v2/users/getOneProduct");
const { isValidObjectId } = require("../../../utils/db");

//---------------------------------v2------------------------------------//
//---------------------------------v2------------------------------------//

module.exports = async (request) => {

  if (!isValidObjectId(request.params.productId)) {
    return serializeHttpResponse(400, {
      message: "Invalid Object Id",
    });
  }

  //---------------------------------v2------------------------------------//
  const oneProduct = await getOneProductService(request.params.productId);
  if (!oneProduct) {
    return serializeHttpResponse(200, {
      message: "Product not found",
    });
  }


  if (oneProduct.userId.toString() !== request.user._id.toString()) {
    return serializeHttpResponse(403, {
      message: "Permission Denied",
    });
  }
  await deleteProductService(request.params.productId);
  
  return serializeHttpResponse(200, {
    message: "Product Deleted",
  });
  //---------------------------------v2------------------------------------//
};

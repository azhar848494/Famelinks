const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const getBrandProductService = require("../../../services/v2/users/getBrandProduct");

module.exports = async (request) => {
  const userId = request.user._id
  const productId = request.params.productId

  try {
    const result = await getBrandProductService({ userId, productId });
    return serializeHttpResponse(200, {
      message: "Brand Prodct Fetched",
      result,
    });
  } catch (error) {
    return serializeHttpResponse(200, {
      message: error.message,
    });
  }
};
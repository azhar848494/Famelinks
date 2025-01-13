const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const getMyBrandProductsService = require("../../../services/v2/users/getMyBrandProduct");

module.exports = async (request) => {
  const result = await getMyBrandProductsService(
    request.user._id,
    request.query.page,
  );

  return serializeHttpResponse(200, {
    message: "Brand Product Fetched",
    result,
  });

};

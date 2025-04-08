const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const getProductGridService = require("../../../services/v2/users/getProductGrid");


module.exports = async (request) => {
  let userId = request.user._id;

  let id = request.params.id;
  let page = request.query.page;

  const result = await getProductGridService({ userId, id, page });

  if (!result) {
    return serializeHttpResponse(500, {
      message: "Failed to fetch product posts",
    });
  }
  return serializeHttpResponse(200, {
    message: "Product posts Fetched",
    result: result[0],
  });
};

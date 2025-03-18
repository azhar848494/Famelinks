const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const getBrandProductsBySearchService = require("../../../services/v2/users/getBrandProductsBySearch");

module.exports = async (request) => {
  let selfId = request.user._id
  console.log('Data ::: ', request.query.search)
  const result = await getBrandProductsBySearchService(
    request.query.page,
    request.query.search,
    selfId
  );
  return serializeHttpResponse(200, {
    message: "Brand Prodcts Fetched",
    result,
  });
};

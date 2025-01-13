const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const getFameCoinService = require("../../../services/v2/users/getFameCoins");

module.exports = async (request) => {
  const result = await getFameCoinService(request.user._id, request.params.fameCoins);
  if (result[0].fameCoins > request.params.fameCoins) {
    return serializeHttpResponse(200, {
      message: "FameCoins Available",
      result: true,
    });
  }
  return serializeHttpResponse(400, {
    message: "FameCoins not available",
    result: false,
  });
};

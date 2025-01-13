const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const {
  getTrendSettingData,
} = require("../../../data-access/v3/fametrendzs");

module.exports = async (request) => {
  const result = await getTrendSettingData(
    request.user._id,
  );

  return serializeHttpResponse(200, {
    message: "Fametrend Setting Data fetch successfully",
    result,
  });
};

const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const getSettingService = require("../../../services/v2/users/getSetting");

module.exports = async (request) => {
  let result = await getSettingService(request.query.type);

  if (!result) {
    return serializeHttpResponse(500, {
      message: "Failed to fetch setting",
    });
  }

  return serializeHttpResponse(200, {
    message: "Setting fetched succesfuly",
    result,
  });
};

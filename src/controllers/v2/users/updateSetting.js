const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const updateSettingService = require("../../../services/v2/users/updateSetting");

module.exports = async (request) => {
  let id = request.user._id;
  let body = request.body;

  await updateSettingService(id, body);

  return serializeHttpResponse(200, {message: "User Updated"});
};

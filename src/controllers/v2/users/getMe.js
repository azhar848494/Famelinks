const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const getOneUserService = require("../../../services/v2/users/getOneUser");
const { isValidObjectId } = require("../../../utils/db");
const appConfig = require("../../../../configs/app.config");
module.exports = async (request) => {
  if (!isValidObjectId(request.user._id)) {
    return serializeHttpResponse(400, {
      message: "Invalid User Id",
    });
  }

  const result = await getOneUserService(request.user._id);

  if (!result) {
    return serializeHttpResponse(200, {
      message: "User not found",
    });
  }
  result.s3 = {
    bucket: appConfig.s3.bucket,
    s3UrlPath: appConfig.s3.s3UrlPath ? appConfig.s3.s3UrlPath : "",
  };
  result.Ad_frequency = appConfig.Ad_frequency

  return serializeHttpResponse(200, {
    result,
    message: "User Fetched",
  });
};

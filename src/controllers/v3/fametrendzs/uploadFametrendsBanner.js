const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const uploadFametrendzBannerService = require("../../../services/v3/fametrendzs/uploadFametrendzBanner");

module.exports = async (request) => {
  const result = await uploadFametrendzBannerService(
    request.files,
    request.image_name
  );

  if (!result) {
    return serializeHttpResponse(400, {
      message: "Failed to upload Fametrendz Banner",
    });
  }

  return serializeHttpResponse(200, {
    message: "Fametrendz Banner Uploaded Sucessfully",
    result,
  });
};
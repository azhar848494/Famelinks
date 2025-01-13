const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const deleteFametrendzService = require("../../../services/v3/fametrendzs/deleteFametrendz");
const { isValidObjectId } = require("../../../utils/db");
const { getOneFametrendz } = require("../../../data-access/v3/fametrendzs");

module.exports = async (request) => {
  let selfUserId = request.user._id;

  if (!isValidObjectId(request.params.trendzId)) {
    return serializeHttpResponse(400, {
      message: "Invalid Trendz Id",
    });
  }

  const Trendz = await getOneFametrendz(request.params.trendzId);

  if (!Trendz) {
    return serializeHttpResponse(400, {
      message: "Trendz not found",
    });
  }

  if (Trendz.sponsor.toString() !== selfUserId.toString()) {
    return serializeHttpResponse(403, {
      message: "Permission Denied",
    });
  }

  await deleteFametrendzService(request.params.trendzId);

  return serializeHttpResponse(200, {
    message: "Fametrendz deleted",
  });
};

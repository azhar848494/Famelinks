const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const updateFametrendzService = require("../../../services/v3/fametrendzs/updateFametrendz");
const { isValidObjectId } = require("../../../utils/db");
const { getOneFametrendz } = require("../../../data-access/v3/fametrendzs");

module.exports = async (request) => {
  let payload = request.body;

  console.log('request ::: ', request)
  let selfUserId = request.user._id;

  if (payload.location) payload.location = JSON.parse(payload.location);
  if (payload.for) payload.for = JSON.parse(payload.for);
  console.log('payload ::: ', payload)

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
  await updateFametrendzService(request.params.trendzId, request.body);

  return serializeHttpResponse(200, {
    message: "Fametrendz Updated",
  });
};

const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const getEditFametrendz = require("../../../services/v3/fametrendzs/getEditFametrendz");
const { isValidObjectId } = require("../../../utils/db");

module.exports = async (request) => {
  let trendzId = request.params.id;

  if (!isValidObjectId(trendzId)) {
    return serializeHttpResponse(400, {
      message: "Invalid Trendz Id",
    });
  }

  const result = await getEditFametrendz(trendzId);

  if (!result) {
    return serializeHttpResponse(404, {
      message: "Saved Fametrendzs not found",
    });
  }
  return serializeHttpResponse(200, {
    message: "Saved Fametrendzs Fetched",
    result,
  });
};
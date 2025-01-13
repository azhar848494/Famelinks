const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const getSavedFametrendzs = require("../../../services/v3/fametrendzs/getSavedFametrendzs");
const { isValidObjectId } = require("../../../utils/db");

module.exports = async (request) => {
  let page = request.query.page
  let userId = request.user._id;

  const result = await getSavedFametrendzs(page, userId);

  if (!result) {
    return serializeHttpResponse(404, {
      message: "Saved Fametrendzs not found",
      result,
    });
  }
  return serializeHttpResponse(200, {
    message: "Saved Fametrendzs Fetched",
    result,
  });
};
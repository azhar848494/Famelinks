const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const getSavedTalentsService = require("../../../services/v2/joblinks/getSavedTalents");
const { isValidObjectId } = require("../../../utils/db");

module.exports = async (request) => {
  let page = request.query.page;
  let masterId = request.user._id;

  let result = await getSavedproductsService( masterId, page);

  if (!result) {
    return serializeHttpResponse(500, {
      message: "Failed to fetch Saved Brand Products",
    });
  }

  return serializeHttpResponse(200, {
    message: "Saved Brand Products fetched succesfuly",
    result,
  });
};

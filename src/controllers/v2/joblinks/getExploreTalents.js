const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const getTalentService = require("../../../services/v2/joblinks/getTalents");
const { isValidObjectId } = require("../../../utils/db");

module.exports = async (request) => {
  const page = request.query.page || 1;
  const userId = request.user._id;

  let result = await getTalentService({ page, userId });

  if (!result) {
    return serializeHttpResponse(500, {
      message: "Failed to Explore Talents",
    });
  }

  return serializeHttpResponse(200, {
    message: "Explore Talents fetched succesfuly",
    result,
  });
};

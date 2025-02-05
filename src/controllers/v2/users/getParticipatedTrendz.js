const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const getParticipatedTrendzService = require("../../../services/v2/users/getParticipatedTrendz");

module.exports = async (request) => {
  const userId = request.user._id
  try {
    const result = await getParticipatedTrendzService({ userId });
    return serializeHttpResponse(200, {
      message: "Trendz Fetched",
      result,
    });
  } catch (error) {
    return serializeHttpResponse(200, {
      message: error.message,
    });
  }
};
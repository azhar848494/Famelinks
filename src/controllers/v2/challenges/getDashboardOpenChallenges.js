const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const getDashboardOpenChallengesService = require("../../../services/v2/challenges/getDashboardOpenChallenges");

module.exports = async (request) => {
  let sponsorId = request.query.sponsorId;
  sponsorId = sponsorId ? sponsorId : "*";

  const result = await getDashboardOpenChallengesService(
    request.user._id,
    request.user._id,
    sponsorId,
    request.query.page,
    request.query.search,
  );
  return serializeHttpResponse(200, {
    message: "Challenges Fetched",
    result,
  });
};

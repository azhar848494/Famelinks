const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const getWelcomeVideoService = require("../../../services/v3/followlinks/getWelcomeVideo");

module.exports = async (request) => {

  switch (request.user.type) {
    case "brand":
      childProfileId = request.user.profileStorelinks;
      break;
    case "agency":
      childProfileId = request.user.profileCollablinks;
      break;
    default:
      childProfileId = request.user.profileFollowlinks;
      break;
  }

  const result = await getWelcomeVideoService(
    request.user.profileFollowlinks,
    request.user._id,
    request.query.page,
  );

  if (!result) {
    return serializeHttpResponse(500, {
      message: "Failed to fetch welcome videos",
      result,
    });
  }

  return serializeHttpResponse(200, {
    message: "Welcome videos Fetched successfully",
    result,
  });
  //---------------------------------v2------------------------------------//
};

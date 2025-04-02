const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const storeSession = require("../../../services/v2/users/storeSession");

module.exports = async (request) => {
  let type = request.params.type;
  let userId = request.user._id;

  let result = await storeSession({ type, userId });

  if (!result) {
    return serializeHttpResponse(500, {
      message: 'Failed to store session',
    });
  }

  return serializeHttpResponse(200, {
    message: 'Session Stored',
  });
};

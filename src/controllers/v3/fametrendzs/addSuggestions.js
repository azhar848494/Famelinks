const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const addTrendzSuggestion = require("../../../services/v3/fametrendzs/addSuggestion");
const { isValidObjectId } = require("../../../utils/db");


module.exports = async (request) => {
  let payload = request.body;
  let selfUserId = request.user._id;
  payload.userId = selfUserId;

  payload.gender = JSON.parse(payload.gender);
  payload.age = JSON.parse(payload.age);
  payload.type = JSON.parse(payload.type);
  
  if (!isValidObjectId(request.body.userId)) {
    return serializeHttpResponse(400, {
      message: "Invalid userId",
    });
  }
  let result = await addTrendzSuggestion(payload);

  if (!result) {
    return serializeHttpResponse(500, {
      message: "Failed to add fametrendz suggestion",
    });
  }

  return serializeHttpResponse(200, {
    message: "fametrendz suggestion added successfuly",
    result,
  });
};

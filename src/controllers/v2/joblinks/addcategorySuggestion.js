const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const addCategorySuggestion = require("../../../services/v2/joblinks/addCategorySuggestion");

module.exports = async (request) => {
    let userId = request.user._id
    request.body.suggestedBy = userId;
    
  const result = await addCategorySuggestion(request.body);

  if (!result) {
    return serializeHttpResponse(500, {
      message: "Failed to add Category suggestion",
    });
  }

  return serializeHttpResponse(200, {
    message: "Category suggestion added successfuly",
    result,
  });
};

const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const addFameContest = require("../../../services/v3/fameContest/addFameContest");

module.exports = async (request) => {
  let payload = request.body;
  let selfUserId = request.user._id;

  
  payload.sponsoredBy = selfUserId;
  let result = await addFameContest(payload);

 
   if (!result) {
    return serializeHttpResponse(500, {
      message: "Failed to create fameContest",
    });
  }

  return serializeHttpResponse(200, {
    message: "fameContest created successfuly",
    result,
  });
};

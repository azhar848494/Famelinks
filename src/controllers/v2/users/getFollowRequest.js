const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const { getFollowRequest, getFollowRequestCount } = require(`../../../services/v2/users/getFollowRequest`);

module.exports = async (request) => {
  let page = request.query.page;
  let masterId = request.user._id;

  let result = await getFollowRequest(masterId, page);
  let result2 = await getFollowRequestCount(masterId);

  let totalRequest = 0;
  if(result2 && result2.length > 0){
    totalRequest = result2[0]['total'];
  }

  if (!result) {
    return serializeHttpResponse(500, {
      message: "Failed to fetch request",
    });
  }

  return serializeHttpResponse(200, {
    message: "Request fetched succesfuly",
    result: {
      "totalRequest": totalRequest,
      "data": result,
    },
  });
};

const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const getMyFunLinksService = require("../../../services/v2/funlinks/getMyFunLinks");
const { isValidObjectId } = require('../../../utils/db');

module.exports = async (request) => {
  let hashTagId = request.query.hashTagId;

  if (!isValidObjectId(request.params.userId)) {
    return serializeHttpResponse(400, {
      message: 'Invalid Object Id'
    });
  }

  const result = await getMyFunLinksService(
    request.params.userId,//user id
    request.user._id,//profile id
    request.user._id,//token id
    hashTagId,//hash id
  );
  return serializeHttpResponse(200, {
    message: "FunLinks Fetched",
    result,
  });
};

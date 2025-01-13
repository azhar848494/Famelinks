const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const getMyFunLinksService = require("../../../services/v2/funlinks/getMyFunLinks");
const { isValidObjectId } = require('../../../utils/db');

const getFunlinksProfile = require("../../../services/v2/users/getChildProfile");

module.exports = async (request) => {
  let hashTagId = request.query.hashTagId;

  if (!isValidObjectId(request.params.userId)) {
    return serializeHttpResponse(400, {
      message: 'Invalid Object Id'
    });
  }

  let userProfileId = await getFunlinksProfile(request.params.userId, "funlinks");

  const result = await getMyFunLinksService(
    userProfileId[0]._id,//user id
    request.user._id,//profile id
    request.user._id,//token id
    hashTagId,//hash id
  );
  return serializeHttpResponse(200, {
    message: "FunLinks Fetched",
    result,
  });
};

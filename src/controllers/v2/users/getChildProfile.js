const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const { getChatByMembers } = require("../../../data-access/v3/chats");

const getChildProfile = require(`../../../services/v2/users/getChildProfile`);
const convert = require('../../../utils/convertObjectId')

module.exports = async (request) => {
  try {
    let masterUserId = convert(request.params.masterUserId);
    let linkType = request.params.linkType;
    let profile = 'self'

    if (request.user._id != masterUserId) {
      profile = 'other'
    }

    let result = await getChildProfile(
      masterUserId,
      linkType,
      profile,
      request.user._id,
      request.query.page,
      request.user._id,
      request.user._id
    );

    if (!result) {
      return serializeHttpResponse(500, {
        message: `Failed to fetch ${linkType} user profile`,
      });
    }

    if (result && result.length == 0) {
      return serializeHttpResponse(500, {
        message: `Failed to fetch ${linkType} user profile`,
      });
    }

    const chat = await getChatByMembers([masterUserId, request.user._id]);
    result[0].chatId = chat ? chat._id : null;

    return serializeHttpResponse(200, {
      message: `${linkType} user profile fetched`,
      result,
    });
  } catch (error) {
    console.log("Stack trace:", error.stack);
    return serializeHttpResponse(500, {
      message: error.message,
    });
  }
};

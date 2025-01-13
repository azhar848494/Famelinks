const serializeHttpResponse = require('../../../helpers/serialize-http-response')
const followUnfollowService = require('../../../services/v2/channels/followUnfollow')
const { isValidObjectId } = require("../../../utils/db");
const { canUnfollow } = require("../../../data-access/v2/users");

module.exports = async (request) => {
    let channelId = request.params.channelId

    if (!isValidObjectId(channelId)) {
        return serializeHttpResponse(400, {
            message: 'Invalid channel Id'
        });
    }
    
    const resFollow = await canUnfollow({type: 'channel', userId: request.user._id});
  
    if (resFollow == false) {
      return serializeHttpResponse(200, {
        message: "Unfollow limit reached. Try after some time",
      });
    }

    result = await followUnfollowService(request.user._id, channelId, 'unfollow')

    if (!result) {
        return serializeHttpResponse(500, {
            message: 'Failed to unfollow the channel',
        });
    }

    return serializeHttpResponse(200, {
        message: 'Channel unfollowed successfuly',
        result
    });
}

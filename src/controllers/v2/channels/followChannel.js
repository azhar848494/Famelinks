const serializeHttpResponse = require('../../../helpers/serialize-http-response')
const followUnfollowService = require('../../../services/v2/channels/followUnfollow')
const { isValidObjectId } = require("../../../utils/db");
const { canFollow } = require("../../../data-access/v2/users");

module.exports = async (request) => {
    let channelId = request.params.channelId

    if (!isValidObjectId(channelId)) {
        return serializeHttpResponse(400, {
            message: 'Invalid channel Id'
        });
    }
    
    const resFollow = await canFollow({type: 'channel',  userId: request.user._id});
  
    if (resFollow == false) {
      return serializeHttpResponse(200, {
        message: "Follow limit reached. Try after some time",
      });
    }

    const result = await followUnfollowService(request.user._id, channelId, 'follow')

    if (!result) {
        return serializeHttpResponse(500, {
            message: 'Failed to follow the channel',
        });
    }

    if(result.upsertedId == null){
        return serializeHttpResponse(200, {
            message: "Channel followed already",
        });
    }

    return serializeHttpResponse(200, {
        message: 'Channel followed successfuly',
        result
    });
}

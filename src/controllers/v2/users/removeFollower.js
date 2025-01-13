const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const { isValidObjectId } = require("../../../utils/db");
const getOneUserService = require('../../../services/v2/users/getOneUser');
const followUserService = require('../../../services/v2/users/followUnfollowUser');

module.exports = async (request) => {
    if (!isValidObjectId(request.params.followerId)) {
        return serializeHttpResponse(400, {
            message: 'Invalid followerId'
        });
    }

    if (request.params.followerId == request.user._id) {
        return serializeHttpResponse(400, {
            message: 'FollowerId and FollowerId cannot be same'
        });
    }

    const user = await getOneUserService(request.params.followerId);
    if (!user) {
        return serializeHttpResponse(200, {
            message: 'Follower Not found',
        });
    }
    await followUserService(request.params.followerId, request.user._id, false);
    return serializeHttpResponse(200, {
        message: 'Follower Removed'
    });
};
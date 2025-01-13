const serializeHttpResponse = require('../../../helpers/serialize-http-response');
const getMyFollowLinksService = require('../../../services/v2/followlinks/getMyFollowLinks');
const { isValidObjectId } = require('../../../utils/db');
const getFollowlinksProfile = require('../../../services/v2/users/getChildProfile')

module.exports = async (request) => {
    let postId = request.query.postId;
    postId = postId ? postId : "*";
    let profileId = await getFollowlinksProfile(request.params.userId, 'followlinks')

    if (!isValidObjectId(request.params.userId)) {
        return serializeHttpResponse(400, {
            message: 'Invalid Object Id'
        });
    }
    
    const result = await getMyFollowLinksService(
        profileId[0]._id,
        request.query.page,
        request.user._id,
        request.user._id,
        postId
    );

    return serializeHttpResponse(200, {
        message: 'FollowLinks Fetched',
        result
    });
};
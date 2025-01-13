const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const acceptRejectFollower = require('../../../services/v2/users/acceptRejectFollower');
const getOneUserService = require('../../../services/v2/users/getOneUser');
const sendNotificationsService = require("../../../services/v2/users/sendNotifications");
const { isValidObjectId } = require("../../../utils/db");

module.exports = async (request) => {
    let action = request.params.action

    let accept = (action == 'accept') ? true : false

    let followerId = request.params.followerId

    if (!isValidObjectId(followerId)) {
        return serializeHttpResponse(400, {
            message: 'Invalid followerId'
        });
    }

    if (followerId.toString() === request.user._id.toString()) {
        return serializeHttpResponse(400, {
            message: 'FollowerId and requested userId cannot be same'
        });
    }

    const user = await getOneUserService(followerId, request.user._id, true);

    if (!user) {
        return serializeHttpResponse(400, {
            message: 'Follower Not found',
        });
    }

    if (user.followStatus == 'accepted' && accept) {
        return serializeHttpResponse(200, {
            message: 'Request accepted already',
        });
    }

    if (!user.followStatus && accept) {
        return serializeHttpResponse(200, {
            message: 'Cannot accept request which does not exists',
        });
    }

    if (!user.followStatus && !accept) {
        return serializeHttpResponse(200, {
            message: 'Cannot reject already rejected follow request',
        });
    }

    let result = await acceptRejectFollower(followerId, request.user._id, accept)

    if (!result) {
        return serializeHttpResponse(500, {
            message: `Failed to ${action} follower`,
        });
    }

    //No use -> suggested by Kalyan sir
    // if (user.pushToken && result && accept) {
    //     await sendNotificationsService('requestAccepted', {
    //         sourceName: request.user.name,
    //         sourceId: request.user._id,
    //         sourceMedia: request.user.profileImage,
    //         sourceType: request.user.type
    //     }, null, {
    //         targetId: user._id,
    //         pushToken: user.pushToken,
    //         count: user.followersCount,
    //         userId: user._id,
    //         targetMedia: user.profileImage
    //     }, user.settings.notification.requestAccepted, true);
    // }

    if (request.user.pushToken && result && accept) {
        await sendNotificationsService('followUser', {
            sourceName: user.name,//request.user.name,
            sourceId: user._id,//request.user._id,
            sourceMedia: user.profileImage,//request.user.profileImage,
            sourceType: user.type//request.user.type
        }, null, {
            targetId: request.user._id,//user._id,
            pushToken: request.user.pushToken,//user.pushToken,
            count: request.user.followersCount,//user.followersCount,
            userId: request.user._id,//user._id,
            targetMedia: request.user.profileImage,//user.profileImage
        }, request.user.settings.notification.newFollower, true);//user.settings.notification.newFollower, true);
    }

    return serializeHttpResponse(200, {
        message: `Follower ${action} successful`
    });

}
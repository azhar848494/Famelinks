const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const recieveFameCoin = require('../../../services/v2/users/recieveFameCoin');
const sendNotificationsService = require("../../../services/v2/users/sendNotifications");
const getOneUserService = require("../../../services/v2/users/getOneUser");
const UserDB = require("../../../models/v2/users");

module.exports = async (request) => {
    await recieveFameCoin(request.body.type, request.user._id, request.body.coins);
    let fameCoins;
    if (request.body.type === 'ads')
        fameCoins = 1;
    if (request.body.type === 'performance')
        fameCoins =  5;
    if (request.body.type === 'redeem')
        fameCoins =  7;
    const user = await getOneUserService(request.user._id);
    if (user.pushToken) {
        await sendNotificationsService('receiveFameCoin', {
            sourceName: request.user.name,
            sourceId: request.user._id,
            sourceMedia: request.user.profileImage,
            sourceType: request.user.type,
            targetName: request.user.name,
        }, fameCoins, {
            targetId: request.params.mediaId,
            pushToken: user.pushToken,
            count: user.commentsCount,
            userId: user._id,
            targetMedia: user.profileImage,
        }, true, true );
    }
    return serializeHttpResponse(200, {
        message: 'FameCoins Receive Successfully'
    });
};

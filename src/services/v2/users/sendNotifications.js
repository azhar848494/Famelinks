const { updateNotifications } = require("../../../data-access/v2/users");
const { generateNotification, sendPushNotifications } = require("../../../utils/notification");

module.exports = async (
    type,
    { sourceName, sourceId, sourceMedia,sourceMediaType, sourceType, targetName },
    data,
    { targetId, pushToken, count, userId, targetMedia, postType, category, tagId },
    isSendPushNotification,
    isSaveInDB,
) => { 
    if (type === 'likePost') {
        switch (data) {
            case 1:
                data = 'Good';
                break;
            case 2:
                data = 'Awesome';
                break;
        }
    }

    if (count) {
        sourceName = `${sourceName} & ${count} ${count === 1 ? 'other' : 'others'}`;
    }

    const { pushNotification, inAppNotification } = generateNotification({
        type,
        source: sourceName,
        data,
        targetName
    });
    if (type === 'sendFameCoin') {
        if (isSaveInDB) {
            await updateNotifications(
                targetId,
                userId,
                type,
                sourceId,
                inAppNotification.body + ' ' + targetName,
                sourceMedia,
                sourceMediaType,
                targetMedia,
                inAppNotification.source,
                inAppNotification.data,
                inAppNotification.action,
                postType,
                sourceType
            );
        }
    } else {
        if (isSaveInDB) {
            await updateNotifications(
                targetId,
                userId,
                type,
                sourceId,
                inAppNotification.body,
                sourceMedia,
                sourceMediaType,
                targetMedia,
                inAppNotification.source,
                inAppNotification.data,
                inAppNotification.action,
                postType,
                sourceType,
                category,
                tagId
            );
        }
    }
    if (isSendPushNotification) {
        await sendPushNotifications(pushNotification, pushToken, { sourceName, sourceId, targetId, type, sourceType });
    }
    return inAppNotification;
};
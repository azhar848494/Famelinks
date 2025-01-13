const serializeHttpResponse = require('../../../helpers/serialize-http-response');
const getNotificationsService = require('../../../services/v2/users/getNotifications');

module.exports = async (request) => {
    const result = await getNotificationsService(request.user._id, request.query.page, request.query.type, request.query.category);
    return serializeHttpResponse(200, {
        message: 'Notifications Fetched',
        result
    });
};
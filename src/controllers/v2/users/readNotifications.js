const serializeHttpResponse = require('../../../helpers/serialize-http-response');
const markAsReadService = require('../../../services/v2/users/markAsRead');

module.exports = async (request) => {
    await markAsReadService(request.user._id, request.query.type); 
    return serializeHttpResponse(200, {
        message: 'Marked as read'
    });
};
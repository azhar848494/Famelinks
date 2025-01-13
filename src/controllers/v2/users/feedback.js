const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const feedbackService = require('../../../services/v2/users/feedback');

module.exports = async (request) => {
    await feedbackService(request.user._id, request.body.body);
    return serializeHttpResponse(200, {
        message: 'Feedback recorded'
    });
};
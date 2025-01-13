const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const reportService = require('../../../services/v2/users/report');
const { isValidObjectId } = require("../../../utils/db");

module.exports = async (request) => {
    if (!isValidObjectId(request.params.commentId)) {
        return serializeHttpResponse(400, {
            message: 'Invalid Comment'
        });
    }
    await reportService(request.user._id, { body: request.body.body }, 'comment', request.params.commentId, request.body.type);
    return serializeHttpResponse(200, {
        message: 'Comment Reported'
    });
};
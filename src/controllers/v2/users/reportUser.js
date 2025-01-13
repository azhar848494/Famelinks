const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const reportService = require('../../../services/v2/users/report');
const { isValidObjectId } = require("../../../utils/db");

module.exports = async (request) => {
    if (!isValidObjectId(request.params.userId)) {
        return serializeHttpResponse(400, {
            message: 'Invalid User Id'
        });
    }
    await reportService(request.user._id, { body: request.body.body }, 'user', request.params.userId, request.body.type);
    return serializeHttpResponse(200, {
        message: 'User Reported'
    });
};
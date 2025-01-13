const serializeHttpResponse = require('../../../helpers/serialize-http-response');
const verifyUpdateMailService = require('../../../services/v2/users/verifyUpdateMail');

module.exports = async (request) => {
    const result = await verifyUpdateMailService(request.body, request.user._id);

    if (!result) {
        return serializeHttpResponse(401, {
            message: 'OTP Mismatch'
        });
    }

    return serializeHttpResponse(200, {
        message: 'Email Updated',
    });
};
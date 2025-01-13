const serializeHttpResponse = require('../../../helpers/serialize-http-response');
const verifyOtpService = require('../../../services/v2/users/verifyOtp');

module.exports = async (request) => {
    const result = await verifyOtpService(request.body);

    if (!result) {
        return serializeHttpResponse(401, {
            message: 'OTP Mismatch'
        });
    }

    return serializeHttpResponse(200, {
        message: 'OTP Verified',
        result
    });
};
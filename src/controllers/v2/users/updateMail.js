const serializeHttpResponse = require('../../../helpers/serialize-http-response');
const getUserByEmailService = require('../../../services/v2/users/getUserByEmail');
const sendOtpService = require('../../../services/v2/users/sendOtp');

module.exports = async (request) => {

    const user = await getUserByEmailService(request.body.email);
    if (user) {
        return serializeHttpResponse(400, {
            message: 'This email is already present'
        });
    }

    const result = await sendOtpService(request.body);
    return serializeHttpResponse(200, {
        message: 'OTP sent',
        result: {
            expiryTimeInSeconds: result.expiryTimeInSeconds,
            otpHash: result.token
        }
    });
};
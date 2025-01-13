const serializeHttpResponse = require('../../../helpers/serialize-http-response');
const sendOtpService = require('../../../services/v2/users/sendOtp');
const { getValidPhoneNumber } = require('../../../utils/phoneNumber');

module.exports = async (request) => {
    const mobileNumber = getValidPhoneNumber(request.body.code, request.body.mobileNumber);
    if (!mobileNumber) {
        return serializeHttpResponse(400, {
            message: 'Invalid Mobile Number'
        });
    }

    request.body.mobileNumber = mobileNumber;

    const result = await sendOtpService(request.body);
    return serializeHttpResponse(200, {
        message: 'OTP sent',
        result: {
            expiryTimeInSeconds: result.expiryTimeInSeconds,
            otpHash: result.token
        }
    });
};
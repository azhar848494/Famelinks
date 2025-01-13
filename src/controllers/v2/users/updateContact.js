const serializeHttpResponse = require('../../../helpers/serialize-http-response');
const getUserByMobileNumberService = require('../../../services/v2/users/getUserByMobileNumber');
const sendOtpService = require('../../../services/v2/users/sendOtp');
const { getValidPhoneNumber } = require('../../../utils/phoneNumber');

module.exports = async (request) => {
    const mobileNumber = getValidPhoneNumber(request.body.code, request.body.mobileNumber);
    if (!mobileNumber) {
        return serializeHttpResponse(400, {
            message: 'Invalid Mobile Number'
        });
    }

    const user = await getUserByMobileNumberService(mobileNumber);
    if (user) {
        return serializeHttpResponse(400, {
            message: 'This number is already registered'
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
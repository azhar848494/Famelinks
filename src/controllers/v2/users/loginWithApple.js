const serializeHttpResponse = require('../../../helpers/serialize-http-response');
const verifyOtpService = require('../../../services/v2/users/verifyOtp');
const loginWithEmailService = require('../../../services/v2/users/loginWithEmail');
const { getValidPhoneNumber2 } = require('../../../utils/phoneNumber');

module.exports = async (request) => {
    let result;
    if (request.body.mobileNumber || (!request.body.mobileNumber && request.body.appleId)) {
        if (request.body.mobileNumber) {
            const mobileNumber = getValidPhoneNumber2(request.body.mobileNumber);
            if (!mobileNumber) {
                return serializeHttpResponse(400, {
                    message: 'Invalid Mobile Number'
                });
            }
            request.body.mobileNumber = mobileNumber;
        }
        result = await verifyOtpService(request.body);
    } else if (request.body.email || (!request.body.email && request.body.appleId)) {
        result = await loginWithEmailService(request.body);
    } else {
        return serializeHttpResponse(400, {
            message: 'Login Failed',
        });
    }
    if (!result) {
        return serializeHttpResponse(401, {
            message: 'Login Failed',
        });
    }
    return serializeHttpResponse(200, {
        message: 'Success',
        result
    });
};
const serializeHttpResponse = require('../../../helpers/serialize-http-response');
const verifyUpdateContactService = require('../../../services/v2/users/verifyUpdateContact');

module.exports = async (request) => {
    const result = await verifyUpdateContactService(request.body, request.user._id);

    if (!result) {
        return serializeHttpResponse(401, {
            message: 'OTP Mismatch'
        });
    }

    return serializeHttpResponse(200, {
        message: 'Contact Number Updated',
    });
};
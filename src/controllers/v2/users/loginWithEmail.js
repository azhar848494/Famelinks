const serializeHttpResponse = require('../../../helpers/serialize-http-response');
const loginWithEmailService = require('../../../services/v2/users/loginWithEmail');

module.exports = async (request) => {
    const result = await loginWithEmailService(request.body);

    if(!result){
        return serializeHttpResponse(500, {
            message: 'Failed to login',
        });    
    }

    return serializeHttpResponse(200, {
        message: 'Success',
        result
    });
};
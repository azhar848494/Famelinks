const serializeHttpResponse = require('../../../helpers/serialize-http-response');
const getUserByUsernameService = require('../../../services/v2/users/getUserByUsername');

module.exports = async (request) => {
    const result = await getUserByUsernameService(request.params.username);
    if (result) {
        return serializeHttpResponse(200, {
            message: 'Username not available',
            result: {
                isAvailable: false
            }
        });
    }
    return serializeHttpResponse(200, {
        message: 'Username Available',
        result: {
            isAvailable: true
        }
    });
};
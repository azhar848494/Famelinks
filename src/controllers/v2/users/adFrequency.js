const serializeHttpResponse = require('../../../helpers/serialize-http-response');

module.exports = async () => {
    return serializeHttpResponse(200, {
        result: {
            adFrequency: 5
        },
        message: 'Success',
    });
};
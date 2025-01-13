const serializeHttpResponse = require("../../../helpers/serialize-http-response");

module.exports = async () => {
    return serializeHttpResponse(200, {
        message: 'Country Codes Fetched',
        result: {
            data: [{
                country: 'India',
                code: '91'
            }, {
                country: 'Nepal',
                code: '977'
            }, {
                country: 'Sri Lanka',
                code: '94'
            }, {
                country: 'Bangladesh',
                code: '880'
            }]
        }
    });
};
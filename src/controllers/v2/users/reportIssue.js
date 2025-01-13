const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const reportService = require('../../../services/v2/users/report');

module.exports = async (request) => {
    const userId = request.user && request.user._id ? request.user._id : null;
    let result = await reportService(userId, request.body, 'issue');
    
    if(!result){
        return serializeHttpResponse(500, {
            message: 'Failed to rais the issue'
        });    
    }

    return serializeHttpResponse(200, {
        message: 'Issue raised',
        result
    });
};
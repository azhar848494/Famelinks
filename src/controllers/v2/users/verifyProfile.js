const serializeHttpResponse = require('../../../helpers/serialize-http-response');
const verifyProfileService = require('../../../services/v2/users/verifyProfile');
const recognitionService = require('../../../services/v2/users/recognition');

module.exports = async (request) => {
    const video = await verifyProfileService( request.files.video, request.user._id);
    
    if(video){
        recognitionService(request.user._id, video.verificationVideo);
    }

    return serializeHttpResponse(200, {
        message: 'Sent for verification',
    });
};
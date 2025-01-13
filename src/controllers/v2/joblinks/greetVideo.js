const serializeHttpResponse = require('../../../helpers/serialize-http-response');
const greetVideoService = require('../../../services/v2/joblinks/greetVideo')

module.exports = async (request) => {
    let greetVideo = request.files.greetVideo

    let childProfileId = request.user._id

    if (!childProfileId) {
        return serializeHttpResponse(400, {
            message: 'Joblinks profile not found'
        });
    }

    let result = await greetVideoService(greetVideo, childProfileId)

    if (!result) {
        return serializeHttpResponse(500, {
            message: "Failed to upload greeting video",
        });
    }

    return serializeHttpResponse(200, {
        message: "Greeting video successfuly uploaded",
        result
    });
}
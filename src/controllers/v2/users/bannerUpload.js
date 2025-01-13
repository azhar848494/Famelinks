const serializeHttpResponse = require('../../../helpers/serialize-http-response');
const bannerUploadService = require('../../../services/v2/users/bannerUpload');

module.exports = async (request) => {
    let result = await bannerUploadService(request.user._id, request.files);

    if (!result) {
        return serializeHttpResponse(500, {
            message: 'Failed to upload banner',
        });
    }

    return serializeHttpResponse(200, {
        message: 'Banner Updated',
    });
};
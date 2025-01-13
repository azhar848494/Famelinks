const serializeHttpResponse = require('../../../helpers/serialize-http-response');
const bannerDeleteService = require('../../../services/v2/users/bannerDelete');

module.exports = async (request) => {
    let result = await bannerDeleteService(request.user._id, request.params.filename);

    if (!result) {
        return serializeHttpResponse(500, {
            message: 'Failed to delete banner',
        });
    }

    return serializeHttpResponse(200, {
        message: 'Banner Deleted',
    });
};
const { getSavedMusicIds } = require('../../../data-access/v2/users');
const serializeHttpResponse = require('../../../helpers/serialize-http-response');
const getMusicPostsService = require('../../../services/v2/funlinks/getMusicPosts');
const { isValidObjectId } = require('../../../utils/db');

module.exports = async (request) => {
    if (!isValidObjectId(request.params.musicId)) {
        return serializeHttpResponse(400, {
            message: 'Invalid Object Id'
        });
    }

    let result = await getMusicPostsService(request.user._id, request.params.musicId, request.query.page);
    if (result) {
        result = result[0];
    }

    return serializeHttpResponse(200, {
        message: 'FunLinks Fetched',
        result
    });
};
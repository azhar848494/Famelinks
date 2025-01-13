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

    const user = await getSavedMusicIds(request.user._id);
    const isSaved = user.savedMusic && user.savedMusic.length
        ? user.savedMusic.filter(musicId => musicId.toString() == request.params.musicId.toString()).length > 0
        : false;
    const result = await getMusicPostsService(request.user._id, request.params.musicId, request.query.page);

    return serializeHttpResponse(200, {
        message: 'FunLinks Fetched',
        result: {
            data: result,
            isSaved: isSaved
        }
    });
};
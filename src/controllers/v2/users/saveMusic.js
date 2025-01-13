const getSavedMusicIdsService = require('../../../services/v2/users/getSavedMusicIds');
const serializeHttpResponse = require('../../../helpers/serialize-http-response');
const saveMusicService = require('../../../services/v2/users/saveMusic');
const { isValidObjectId } = require('../../../utils/db');

module.exports = async (request) => {
    if (!isValidObjectId(request.params.musicId)) {
        return serializeHttpResponse(400, {
            message: 'Invalid Object Id'
        });
    }

    const musicResult = await getSavedMusicIdsService(request.user._id);

    const music = musicResult.savedMusic.find(music => music.toString() == request.params.musicId.toString());
    if (music) {
        return serializeHttpResponse(200, {
            message: 'Music already Saved'
        });
    }

    await saveMusicService(request.user._id, request.params.musicId);

    return serializeHttpResponse(200, {
        message: 'Saved',
    });
};
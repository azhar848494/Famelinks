const { getMusic, getMusic2 } = require("../../../data-access/v2/funlinks");
const { getSavedMusicIds, getOneUser } = require("../../../data-access/v2/users");

module.exports = async (page, search, type = 'trending', userId, isMyMusic) => {
    let result;
    let user = await getOneUser(userId);
    const music = await getSavedMusicIds(userId);
    switch (type) {
        case 'trending':
            result = await getMusic2(page, search);
            break;
        case 'voice':
            result = await getMusic2(page, search, 'user', null, userId, isMyMusic);
            break;
        case 'songs':
            result = await getMusic2(page, search, 'admin');
            break;
        case 'saved': {
            if (music) {
                result = (music.savedMusic && music.savedMusic.length) ? (await getMusic2(page, search, null, music.savedMusic)) : [];
            }
            break;
        }
    }

    if (result) {
        return result.map(item => {
            if (music) {
                item.isSaved = Boolean(music.savedMusic.find(musicId => musicId.toString() == item._id.toString()));
            } else {
                item.isSaved = false;
            }
            return item;
        });
    }

    return []
};
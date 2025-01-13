const { getMusic } = require("../../../data-access/v2/funlinks");
const { getSavedMusicIds, getOneUser } = require("../../../data-access/v2/users");

module.exports = async (page, search, type = 'trending', userId) => {
    let result;
    let user = await getOneUser(userId);
    const music = await getSavedMusicIds(user.profileFunlinks);
    switch (type) {
        case 'trending':
            result = await getMusic(page, search);
            break;
        case 'voice':
            result = await getMusic(page, search, 'user');
            break;
        case 'songs':
            result = await getMusic(page, search, 'admin');
            break;
        case 'saved': {
            if (music) {
                result = (music.savedMusic && music.savedMusic.length) ? (await getMusic(page, search, null, music.savedMusic)) : [];
            }
            break;
        }
    }

    if (result) {
        return result.map(item => {
            const minutes = parseInt(item.duration / 60);
            const seconds = parseInt(item.duration % 60);
            if (minutes)
                item.duration = `${minutes}m `;
            else
                item.duration = '';

            if (seconds) {
                item.duration += `${seconds}s`;
            }

            if (music) {
                item.isSaved = Boolean(music.savedMusic.find(musicId => musicId.toString() == item._id.toString()));
            } else {
                item.isSaved = false;
            }

            item.duration = item.duration.trim();
            return item;
        });
    }

    return []
};
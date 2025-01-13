const { getMusicById } = require("../../../data-access/v2/funlinks");
const { getFunlinks } = require('../../../data-access/v3/funlinks')

module.exports = async (page, location, ageGroup, gender, funlinksDate, funlinks) => {
    let filterObj = {}
    if (funlinksDate != '*' && funlinks == 'next') {
        filterObj.$expr = { $lt: ['$createdAt', funlinksDate] }
    }

    if (funlinksDate != '*' && funlinks == 'prev') {
        filterObj.$expr = { $gt: ['$createdAt', funlinksDate] }
    }

    const result = await getFunlinks(page, location, ageGroup, gender, filterObj);
    return Promise.all(
        result.map(async (item) => {
            if (item.musicId) {
                if (!item.audio) {
                    const music = await getMusicById(item.musicId);
                    if (music) {
                        item.audio = music.music;
                        item.musicName = `${item.musicName} - ${music.by}`;
                    }
                } else {
                    item.musicName = `Original Audio - ${item.musicName}`;
                }
            }
            return item;
        })
    );
};

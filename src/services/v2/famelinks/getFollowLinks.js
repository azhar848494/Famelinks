const { getFollowLinks } = require("../../../data-access/v2/famelinks");

module.exports = async (userId, page) => {
    const result = await getFollowLinks(userId, page);
    return result.map(item => {
        item.media = item.media.filter(oneImage => {
            return oneImage.path;
        });
        return item;
    });
};
// const queryConfig = require("../../../../queryConfig");
const { getFameLinksById } = require("../../../data-access/v2/famelinks");
// const randomUtils = require('../../../utils/random');

module.exports = async (profileId, userId, postId) => {
    const [result] = await getFameLinksById(profileId, userId, postId);
    if (!result) {
        return;
    }
    result.media = result.media.filter(oneImage => {
        return oneImage.path;
    });
    return result;
};

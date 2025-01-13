// const queryConfig = require("../../../../queryConfig");
const { getFollowLinksById } = require("../../../data-access/v2/followlinks");
// const randomUtils = require('../../../utils/random');

module.exports = async (profileId, userId, postId) => {
    const [result] = await getFollowLinksById(profileId, userId, postId);
    if (!result) {
        return;
    }
    result.media = result.media.map(oneImage => {
        return {
            path: oneImage.media,
            type: oneImage.type
        };
    });
    return result;
};
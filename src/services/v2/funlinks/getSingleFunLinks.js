// const queryConfig = require("../../../../queryConfig");
const { getFunLinksById } = require("../../../data-access/v2/funlinks");
// const randomUtils = require('../../../utils/random');

module.exports = async (userId, postId) => {
    // const randomNumber = randomUtils.generateNumber(1) % 3;
    // const config = queryConfig[user.gender][user.ageGroup || 'groupE'][randomNumber];
    const [ result ] = await getFunLinksById(userId, postId);
    if (!result) {
        return;
    }
    result.media = result.media.filter(oneImage => {
        return oneImage.path;
    });
    return result;
};
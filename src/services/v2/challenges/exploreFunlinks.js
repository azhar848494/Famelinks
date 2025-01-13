const { exploreFunlinks } = require("../../../data-access/v2/challenges");
const { getChallengeParticipantsCount, getFunLinksById } = require('../../../data-access/v2/funlinks');

module.exports = async (masterUserId, page, profileId) => {
    let result = await exploreFunlinks(page, masterUserId, profileId);
    result = await Promise.all(result.map(async item => {
        item.posts = await Promise.all(item.posts.map(async post => {
            const [result] = await getFunLinksById(masterUserId, post._id, profileId);
            return result;
        }));
        // item.participantsCount = await getChallengeParticipantsCount(item._id);
        item.posts = item.posts.filter(post => post)
        return item;
    }));
    return result
};
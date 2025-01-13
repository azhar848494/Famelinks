const { getChallengeWinners } = require('../../../data-access/v2/challenges');
const { getFameLinksById } = require('../../../data-access/v2/famelinks');
const FametrendzDB = require("../../../models/v2/fametrendzs");
const UserDB = require('../../../models/v2/users');
const { getWinner } = require("../../../utils/getWinners");

module.exports = async (page, userId, profileId) => {
    let result = await getChallengeWinners(userId);

    await Promise.all(result.map(async item => { //item => challenge
        item.posts = await Promise.all(item.posts.map(async post => {
            const [result] = await getFameLinksById(profileId, userId, post._id);
            result.media = result.media.filter(item => item.path);
            return result;
        }));
    }))

    return result
};
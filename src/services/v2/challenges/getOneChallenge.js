const { getOneFamelinksChallenge, getFunChallengeDetails } = require('../../../data-access/v2/challenges');
const { getFameLinksById } = require("../../../data-access/v2/famelinks");

module.exports = async (challengeId, userId) => {
    let result = await getOneFamelinksChallenge(challengeId, userId);

    return Promise.all(
        result.map(async (item) => {
            item.posts = await Promise.all(
                item.posts.map(async (post) => {
                    const [result] = await getFameLinksById(userId, userId, post._id);
                    if (result != undefined || result != null) {
                        result.media = result.media.filter((item) => {
                            return item.path;
                        });
                        return result;
                    }
                })
            );
            item.posts = item.posts.filter((post) => !!post);
            let items, requiredItems;
            item.category === "post"
                ? (items = item.totalPost)
                : item.category === "participants"
                    ? (items = item.totalParticipants)
                    : item.category === "impression"
                        ? (items = item.totalImpressions)
                        : "default";
            requiredItems = item.milestoneAggrement.milestoneValue;
            item.percentCompleted = items > requiredItems ? 100 : Math.round((items / requiredItems) * 100);
            // item.participantsCount = await getChallengeParticipantsCount(item._id);
            return item;
        })
    );
    if (result && result.length == 0) {
        result = await getFunChallengeDetails(challengeId, userId);
        return result;
    }
    return result;
};
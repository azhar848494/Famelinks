const { getFunlinksMusicPosts, getChallengeParticipantsCount: funlinksParticipantCount } = require("../../../data-access/v2/funlinks");

module.exports = async (userId, musicId, page) => {
    const result = await getFunlinksMusicPosts(userId, musicId, page);
    return Promise.all(result.map(async item => {
        item.challenges = await Promise.all(item.challenges.map(async challenge => {
            challenge.percentCompleted = Number(((challenge.totalImpressions / challenge.requiredImpressions) * 100).toFixed(2));
            challenge.participantsCount = await funlinksParticipantCount(challenge._id);
            return challenge;
        }));
        return item;
    }));
};
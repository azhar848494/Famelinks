const { getFunlinksMusicPosts, getChallengeParticipantsCount: funlinksParticipantCount } = require("../../../data-access/v2/funlinks");

module.exports = async (userId, musicId, page) => {
    return await getFunlinksMusicPosts(userId, musicId, page);
};
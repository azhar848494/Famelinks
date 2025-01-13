const {
  getChallengeFamelinks,
  getChallengeFunlinks,
} = require("../../../data-access/v2/challenges");
const {
  getChallengeParticipantsCount: famelinksParticipantCount,
} = require("../../../data-access/v2/famelinks");
const {
  getChallengeParticipantsCount: funlinksParticipantCount,
  getMusicById,
} = require("../../../data-access/v2/funlinks");

module.exports = async (challengeId, postType, page, userId, userType) => {
  if (postType == "famelinks") {
    const result = await getChallengeFamelinks(
      challengeId,
      page,
      userId,
      userId
    );
    return Promise.all(
      result.map(async (item) => {
        item.media = item.media.filter((oneImage) => {
          return oneImage.path;
        });
        item.challenges = await Promise.all(
          item.challenges.map(async (challenge) => {
            let items, requiredItems;
            challenge.category === "post"
              ? (items = challenge.totalPost)
              : challenge.category === "participants"
                ? (items = challenge.totalParticipants)
                : challenge.category === "impression"
                  ? (items = challenge.totalImpressions)
                  : "default";
            requiredItems = challenge.milestoneAggrement.milestoneValue;
            challenge.percentCompleted = items > requiredItems ? 100 : Math.round((items / requiredItems) * 100);
            challenge.participantsCount = await famelinksParticipantCount(
              challenge._id
            );
            return challenge;
          })
        );
        return item;
      })
    );
  }
  const result = await getChallengeFunlinks(
    challengeId,
    page,
    userId,
    userId
  );
  return Promise.all(
    result.map(async (item) => {
      if (item.musicId) {
        const music = await getMusicById(item.musicId);
        if (music) {
          item.audio = music.music;
          item.musicName = `${item.musicName} - by ${music.by}`;
        }
      }
      item.challenges = await Promise.all(
        item.challenges.map(async (challenge) => {
          challenge.percentCompleted = Number(
            (
              (challenge.totalImpressions / challenge.requiredImpressions) *
              100
            ).toFixed(2)
          );
          challenge.participantsCount = await funlinksParticipantCount(
            challenge._id
          );
          return challenge;
        })
      );
      return item;
    })
  );
};

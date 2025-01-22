const {
  getDashboardOpenChallenges,
} = require("../../../data-access/v2/challenges");
const {
  getChallengeParticipantsCount,
  getFameLinksById,
} = require("../../../data-access/v2/famelinks");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

module.exports = async (profileId, userId, sponsorId, page) => {
  let filterObj = {};
  if (sponsorId != "*") {
    filterObj.$expr = { $eq: ["$sponsor", ObjectId(sponsorId)] };
  } else {
    filterObj.$expr = { $and: [{ $lt: ["$startDate", new Date()] }] }
  }

  const result = await getDashboardOpenChallenges(userId, filterObj, page);
  return Promise.all(
    result.map(async (item) => {
      item.posts = await Promise.all(
        item.posts.map(async (post) => {
          const [result] = await getFameLinksById(profileId, userId, post._id);
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
};

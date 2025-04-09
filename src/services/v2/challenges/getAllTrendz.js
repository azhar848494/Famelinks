const { getAlltrendzs } = require("../../../data-access/v2/challenges");

module.exports = async (page, userId, sponsorId) => {
   const result = await getAlltrendzs(page, userId, sponsorId);
   console.log('Data ::: ', result)
   return Promise.all(
    result.map(async (item) => {
      let totalMilestone = 0
      switch (item.category) {
        case 'post':
          totalMilestone = item.totalPost
          break
        case 'participants':
          totalMilestone = item.totalParticipants
          break
        case 'impression':
          totalMilestone = item.totalImpressions
          break
      }
      item.percentCompleted = totalMilestone > (item.milestoneAggrement != null ? item.milestoneAggrement.milestoneValue : 0) ? 100 : Math.round((totalMilestone / (item.milestoneAggrement != null ? item.milestoneAggrement.milestoneValue : 0)) * 100);
      return item;
    })
  );
};

const { getTrend } = require("../../../data-access/v2/challenges");

module.exports = async (data) => {
  const result = await getTrend(data);
  Promise.all(
    result[0]['data'].map(async (item) => {
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
      item.percentCompleted = totalMilestone > item.milestoneValue ? 100 : Math.round((totalMilestone / item.milestoneValue) * 100);
      return item;
    })
  );
  return result;  
};

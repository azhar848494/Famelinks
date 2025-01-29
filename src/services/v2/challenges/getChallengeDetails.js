const { getFameChallengeDetails, getFunChallengeDetails } = require('../../../data-access/v2/challenges');

module.exports = async (data) => {
    if (data.type == 'funlinks') {
        return getFunChallengeDetails(data);
    } else {
        let result = await getFameChallengeDetails(data);
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
                item.percentCompleted = totalMilestone > item.milestoneValue ? 100 : Math.round((totalMilestone / item.milestoneValue) * 100);
                return item;
            })
        );
    }
};
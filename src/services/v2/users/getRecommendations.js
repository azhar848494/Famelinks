const { getRecommendations } = require('../../../data-access/v2/users');

module.exports = async (userId, agencyId) => {
    return getRecommendations(userId, agencyId);
};
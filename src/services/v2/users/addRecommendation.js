const { addRecommendation } = require('../../../data-access/v2/users');

module.exports = async (userId, data, agencyId) => {
    return addRecommendation(userId, data, agencyId);
};
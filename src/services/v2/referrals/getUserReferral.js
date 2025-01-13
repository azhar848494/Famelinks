const { getUserReferral } = require('../../../data-access/v2/referrals');

module.exports = async (referralCode, referredToId) => {
    return getUserReferral(referralCode, referredToId);
};
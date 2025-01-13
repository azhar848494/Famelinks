const { applyReferralCode } = require('../../../data-access/v2/referrals');
const { updateUser, findUserByReferralCode, updateUserCoin } = require('../../../data-access/v2/users');

module.exports = async (referralCode, userId) => {
    const user = await findUserByReferralCode(referralCode);
    if (!user) {
        return false;
    }
    await applyReferralCode(referralCode, userId);
    await updateUser(userId, { referredBy: user._id });
    await updateUserCoin(user._id, 5);
    await updateUserCoin(userId, 5);
    return true;
};
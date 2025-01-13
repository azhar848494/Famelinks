const ReferralDB = require('../../models/v2/referrals');

exports.getUserReferral = (referralCode, referredToId) => {
    return ReferralDB
        .findOne({ referralCode, referredTo: referredToId })
        .lean();
};

exports.applyReferralCode = (referralCode, userId) => {
    return ReferralDB.create({ referralCode, referredTo: userId });
};
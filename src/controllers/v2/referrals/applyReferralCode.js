const serializeHttpResponse = require('../../../helpers/serialize-http-response');
const applyReferralCodeService = require('../../../services/v2/referrals/applyReferralCode');
const getUserReferral = require('../../../services/v2/referrals/getUserReferral');

module.exports = async (request) => {
    const referral = await getUserReferral(request.body.referralCode, request.user._id);
    if (referral) {
        return serializeHttpResponse(200, {
            message: 'ReferralCode already applied'
        });
    }

    if (request.body.referralCode === request.user.referralCode) {
        return serializeHttpResponse(200, {
            message: 'Operation not permitted'
        });
    }

    const isApplied = await applyReferralCodeService(request.body.referralCode, request.user._id);
    if (!isApplied) {
        return serializeHttpResponse(200, {
            message: 'Invalid Referral Code'
        });
    }

    return serializeHttpResponse(200, {
        message: "Referral Applied. You got 5 FameCoins, Refer & Earn more",
    });
};
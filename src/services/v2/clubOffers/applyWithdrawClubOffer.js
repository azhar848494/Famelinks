const { applyWithdrawClubOffer } = require('../../../data-access/v2/clubOffers')

module.exports = async (profileId, offerId, action) => {
    return await applyWithdrawClubOffer(profileId, offerId, action)
}
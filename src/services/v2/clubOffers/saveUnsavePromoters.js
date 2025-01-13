const { saveUnsavePromoters } = require('../../../data-access/v2/clubOffers')

module.exports = async (profileId, offerId, action) => {
    return await saveUnsavePromoters(profileId, offerId, action)
}
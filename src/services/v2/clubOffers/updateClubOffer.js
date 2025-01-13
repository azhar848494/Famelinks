const { updateClubOffer } = require('../../../data-access/v2/clubOffers')

module.exports = async (offerId, payload) => {
    return await updateClubOffer(offerId, payload)
}
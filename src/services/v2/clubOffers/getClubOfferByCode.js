const { getClubOfferByCode } = require('../../../data-access/v2/clubOffers')

module.exports = async (offerCode) => {
    return await getClubOfferByCode(offerCode)
}
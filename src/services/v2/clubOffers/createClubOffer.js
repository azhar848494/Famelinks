const { createClubOffer } = require('../../../data-access/v2/clubOffers')

module.exports = async (payload) => {
    return await createClubOffer(payload)
}
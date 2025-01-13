const { checkApplication } = require('../../../data-access/v2/clubOffers')

module.exports = async (profileId, offerId) => {
    return await checkApplication(profileId, offerId)
}
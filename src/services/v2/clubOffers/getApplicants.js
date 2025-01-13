const { getApplicants } = require('../../../data-access/v2/clubOffers')

module.exports = async (offerId) => {
    return await getApplicants(offerId)
}
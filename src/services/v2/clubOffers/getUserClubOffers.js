const { getUserClubOffers } = require('../../../data-access/v2/clubOffers')

module.exports = async (profileId) => {
    return await getUserClubOffers(profileId)
}
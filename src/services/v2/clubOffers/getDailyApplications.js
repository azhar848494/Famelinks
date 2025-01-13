const { getDailyApplications } = require('../../../data-access/v2/clubOffers')

module.exports = async (funlinksId, followlinksId) => {
    return await getDailyApplications(funlinksId, followlinksId)
}
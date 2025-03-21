const { getClubOffersNew, getClubOffersApplied, getClubOffersInProgress, getClubOffersCompleted } = require('../../../data-access/v2/clubOffers')

exports.getClubOffersNew = async (followlinksId, funlinksId, userType, page) => {
    return await getClubOffersNew(followlinksId, funlinksId, userType, page)
}

exports.getClubOffersApplied = async (followlinksId, funlinksId, userType, page) => {
    return await getClubOffersApplied(followlinksId, funlinksId, userType, page)
}

exports.getClubOffersInProgress = async (followlinksId, funlinksId, userType, page, search) => {
    return await getClubOffersInProgress(followlinksId, funlinksId, userType, page, search)
}

exports.getClubOffersCompleted = async (followlinksId, funlinksId, userType, page) => {
    return await getClubOffersCompleted(followlinksId, funlinksId, userType, page)
}
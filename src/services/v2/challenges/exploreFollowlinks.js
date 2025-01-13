const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId

const { getFollowSuggestions, getInviteSuggestions } = require("../../../data-access/v2/users");
const { getWelcomeVideoFollowees } = require('../../../data-access/v2/followlinks')
const { getChannelSuggestion } = require('../../../data-access/v2/channels')
const { getClubOffersNew,
    getClubOffersApplied,
    getClubOffersInProgress,
    getClubOffersCompleted,
    getDailyApplications,
    getTotalClubOffers,
    getTotalApplications } = require('../../../data-access/v2/clubOffers')
const settingsDB = require('../../../models/v2/settings')
const appConfig = require('../../../../configs/app.config');

module.exports = async (masterId, followlinksId, funlinksId, userType, page) => {
    let result = {}
    let welcomeVideos = []
    let followSuggestions = []
    let inviteSuggestions = []
    let channels = []

    let clubOffersNew = []
    let clubOffersApplied = []
    let clubOffersInProgress = []
    let clubOffersCompleted = []

    // result.explore = {}
    result.clubOffers = {}

    welcomeVideos = await getWelcomeVideoFollowees(masterId, page)
    followSuggestions = await getFollowSuggestions(masterId, page)
    inviteSuggestions = await getInviteSuggestions(masterId, page)
    channels = await getChannelSuggestion(masterId, page)

    // result.explore.welcomeVideos = welcomeVideos
    // result.explore.followSuggestions = followSuggestions
    // result.explore.inviteSuggestions = inviteSuggestions
    // result.explore.channels = channels

    let settings = await settingsDB.findOne({ _id: ObjectId(appConfig.settingsId) })
    let dailyApplications = await getDailyApplications(funlinksId, followlinksId)
    
    clubOffersNew = await getClubOffersNew(followlinksId, funlinksId, userType, page)
    clubOffersApplied = await getClubOffersApplied(followlinksId, funlinksId, userType, page)
    clubOffersInProgress = await getClubOffersInProgress(followlinksId, funlinksId, userType, page)
    clubOffersCompleted = await getClubOffersCompleted(followlinksId, funlinksId, userType, page)

    result.clubOffers.new = clubOffersNew
    result.clubOffers.applied = clubOffersApplied
    result.clubOffers.inProgress = clubOffersInProgress
    result.clubOffers.completed = clubOffersCompleted

    if (userType == 'individual') {
        result.clubOffers.applicationsLeft = (settings.clubOffersApplicationDailyLimit - dailyApplications)
    }

    if (userType == 'brand' || userType == 'agency') {
        result.clubOffers.totalClubOffers = await getTotalClubOffers(followlinksId, funlinksId)
        result.clubOffers.totalApplications = await getTotalApplications(followlinksId, funlinksId)
    }

    return result
}
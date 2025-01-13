const serializeHttpResponse = require('../../../helpers/serialize-http-response')
const grantOffer = require('../../../services/v2/clubOffers/grantOffer')
const { isValidObjectId } = require("../../../utils/db");
const checkApplication = require('../../../services/v2/clubOffers/checkApplication')
const getClubOfferById = require('../../../services/v2/clubOffers/getClubOfferById')
const updateClubOffer = require('../../../services/v2/clubOffers/updateClubOffer')
const getUserClubOffers = require('../../../services/v2/clubOffers/getUserClubOffers')
const settingsDB = require('../../../models/v2/settings')
const appConfig = require('../../../../configs/app.config')

module.exports = async (request) => {
    let profileId = request.body.profileId
    let offerId = request.body.offerId

    if (!isValidObjectId(profileId)) {
        return serializeHttpResponse(400, {
            message: 'Invalid profile Id'
        });
    }

    if (!isValidObjectId(offerId)) {
        return serializeHttpResponse(400, {
            message: 'Invalid offer Id'
        });
    }

    let offer = await getClubOfferById(offerId)

    if (!offer) {
        return serializeHttpResponse(400, {
            message: 'Club offer does not exists'
        })
    }
    
    if (!offer.createdBy.equals(request.user._id)) {
        return serializeHttpResponse(400, {
            message: 'Permission denied. Cannot grant an offer that is not created by you.'
        })
    }

    let todayDate = new Date()
    if (offer.startDate <= todayDate) {
        let updateObj = {}
        updateObj.isClosed = true
        updateObj.isCompleted = true
        await updateClubOffer(offerId, updateObj)

        return serializeHttpResponse(400, {
            message: 'Cannot grant an exprired offer'
        })
    }

    let application = await checkApplication(request.user._id, offerId)

    if (!application) {
        return serializeHttpResponse(400, {
            message: 'Application does not exists'
        })
    }

    if (application.userId.toString() != request.user._id.toString()) {
        return serializeHttpResponse(400, {
            message: 'Applicant id is different from the user id'
        })
    }

    let settings = await settingsDB.findOne({ _id: appConfig.settingsId })
    let userClubOffers = await getUserClubOffers(profileId)

    if (userClubOffers && userClubOffers.length > 0) {
        if (userClubOffers[0].clubOffers.length >= settings.clubOffersLimit) {
            return serializeHttpResponse(400, {
                message: 'Reached maximum limit of club offers granted to user'
            })
        }
    }

    let result = await grantOffer(application, offerId)

    if (!result) {
        return serializeHttpResponse(500, {
            message: 'Failed to grant offer'
        })
    }

    //Send notification to user indicating he has been granted an offer

    return serializeHttpResponse(200, {
        message: 'Offer granted successfuly'
    })
}
const serializeHttpResponse = require('../../../helpers/serialize-http-response')
const applyWithdrawClubOffer = require('../../../services/v2/clubOffers/applyWithdrawClubOffer')
const checkApplication = require('../../../services/v2/clubOffers/checkApplication')
const { isValidObjectId } = require("../../../utils/db");
const getClubOfferById = require('../../../services/v2/clubOffers/getClubOfferById')
const settingsDB = require('../../../models/v2/settings')
const appConfig = require('../../../../configs/app.config')
const getDailyApplications = require('../../../services/v2/clubOffers/getDailyApplications')

module.exports = async (request) => {
    if (request.user.type == 'brand' || request.user.type == 'agency') {
        return serializeHttpResponse(400, {
            message: `Operation denied. ${request.user.type} cannot apply any job`
        });
    }

    let action = request.body.action
    let offerId = request.params.offerId

    if (!isValidObjectId(offerId)) {
        return serializeHttpResponse(400, {
            message: 'Invalid Club Offer Id'
        });
    }

    let clubOffer = await getClubOfferById(offerId)

    if (!clubOffer) {
        return serializeHttpResponse(400, {
            message: 'Club offer does not exists'
        });
    }

    let childProfileId

    if (clubOffer.type == 'followlinks') {
        childProfileId = request.user._id
    }
    if (clubOffer.type == 'funlinks') {
        childProfileId = request.user._id
    }

    let application = await checkApplication(childProfileId, offerId)

    if (application) {
        if (application.status == 'applied' && action == 'apply') {
            return serializeHttpResponse(400, {
                message: "Offer already applied",
            });
        }

        if (application.status == 'selected') {
            return serializeHttpResponse(200, {
                message: "You have already been selected for this offer.",
                result
            });
        }
    }

    if (action == 'apply') {
        let settings = await settingsDB.findOne({ _id: appConfig.settingsId })
        let dailyApplications = await getDailyApplications(request.user._id, request.user._id)

        if (dailyApplications >= settings.clubOffersApplicationDailyLimit) {
            return serializeHttpResponse(400, {
                message: 'Daily limit reached to apply club offers'
            })
        }
    }

    let result = await applyWithdrawClubOffer(childProfileId, offerId, action)

    if (!result) {
        let message = (action == 'apply') ? 'Failed to apply to the club offer' : 'Failed to withdraw application'
        return serializeHttpResponse(500, {
            message
        })
    }

    let message = (action == 'apply') ? 'Applied to the club offer successfuly' : 'Application withdrawn successfuly'
    return serializeHttpResponse(200, {
        message,
        result
    })
}
const { updateApplication, updateClubOffer } = require('../../../data-access/v2/clubOffers')
const offerCodes = require('voucher-code-generator')

module.exports = async (application, offerId) => {
    let updateObj = {}
    application.status = 'selected'
    application.selectedDate = new Date()

    let result = await updateApplication(application._id, application)

    if (!result) { return }

    let code = offerCodes.generate({ length: 10, count: 1, name: 'alphanumerics' })

    if (code && code.length == 0) { return }

    updateObj.offerCode = code[0]
    updateObj.selectedPromoter = application.userId
    updateObj.isClosed = true

    result = await updateClubOffer(offerId, updateObj)

    return result
}
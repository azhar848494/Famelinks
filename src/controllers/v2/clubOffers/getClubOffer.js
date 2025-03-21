const serializeHttpResponse = require('../../../helpers/serialize-http-response')
const { isValidObjectId } = require("../../../utils/db");
const { getClubOffersNew, getClubOffersApplied, getClubOffersInProgress, getClubOffersCompleted } = require('../../../services/v2/clubOffers/getClubOffer')

module.exports = async (request) => {
    let category = request.body.category;
    let page = request.query.page;

    let result = [];
    switch (category) {
        case 'new':
            result = await getClubOffersNew(request.user._id, request.user._id, request.user.type, page);
            break;
        case 'applied':
            result = await getClubOffersApplied(request.user._id, request.user._id, request.user.type, page);
            break;            
        case 'progress':
            result = await getClubOffersInProgress(request.user._id, request.user._id, request.user.type, page, request.query.search);
            break;
        case 'completed':
            result = await getClubOffersCompleted(request.user._id, request.user._id, request.user.type, page);
            break;
    }

    if (!result) {
        return serializeHttpResponse(500, {
            message: 'Failed to fetch club offer'
        })
    }

    return serializeHttpResponse(200, {
        message: 'Club offer fetched successfuly',
        result
    })
}
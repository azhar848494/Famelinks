const serializeHttpResponse = require('../../../helpers/serialize-http-response')
const viewService = require('../../../services/v2/views/view')
const { isValidObjectId } = require("../../../utils/db");
const updateViewsFunlinks = require('../../../services/v2/funlinks/updateViews')
const updateViewsFollowlinks = require('../../../services/v2/followlinks/updateViews')
const getClubOfferById = require('../../../services/v2/clubOffers/getClubOfferById')
const updateClubOffer = require('../../../services/v2/clubOffers/updateClubOffer')

module.exports = async (request, postType) => {
    let mediaId = request.params.mediaId

    if (!isValidObjectId(mediaId)) {
        return serializeHttpResponse(400, {
            message: 'Invalid Object Id'
        });
    }

    const getOnePostService = require(`../../../services/v2/${postType}/getOnePost`);

    let onePost = await getOnePostService(mediaId);
    if (!onePost) {
        return serializeHttpResponse(200, {
            message: 'Post not found'
        });
    }

    let childProfileId

    if (postType == 'funlinks') {
        childProfileId = request.user._id
    }

    if (postType == 'followlinks') {
        childProfileId = request.user._id
    }

    let result = await viewService(mediaId, childProfileId, postType)

    if (!result) {
        return serializeHttpResponse(500, {
            message: 'Failed to submit view on media'
        })
    }

    if (result) {
        switch (postType) {
            case 'funlinks': await updateViewsFunlinks(mediaId, { seen: 1 })
                break;
            case 'followlinks': await updateViewsFollowlinks(mediaId, request.user._id)
                break;
            default:
                break;
        }

        let onePost = await getOnePostService(mediaId);
        if (!onePost) {
            return serializeHttpResponse(200, {
                message: 'Post not found'
            });
        }

        if (onePost.offerId) {
            let clubOffer = await getClubOfferById(onePost.offerId)
            if (onePost.reachIds.length >= clubOffer.requiredMilestone) {
                clubOffer.isCompleted = true
                clubOffer.completedAt = new Date()

                await updateClubOffer(onePost.offerId, clubOffer)
            }
        }
    }

    return serializeHttpResponse(200, {
        message: 'View on media successful'
    })
}
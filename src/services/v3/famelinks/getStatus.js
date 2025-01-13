const { getFamelinksStatus } = require('../../../data-access/v3/famelinks')
const { getBrandPostsStatus } = require('../../../data-access/v3/brandProducts')

module.exports = async (postIds, profileId, masterUserId) => {
    let result = await getFamelinksStatus(postIds, profileId, masterUserId)
    let getBrandPost = await getBrandPostsStatus(postIds, profileId, masterUserId)
    result = result.concat(getBrandPost)
    return result
}
const { viewMedia } = require('../../../data-access/v2/views')

module.exports = async (mediaId, userId, postType) => {
    return await viewMedia(mediaId, userId, postType)
}
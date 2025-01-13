const { updateViews } = require('../../../data-access/v2/followlinks')

module.exports = async (mediaId, userId) => {
    return await updateViews(mediaId, userId)
}
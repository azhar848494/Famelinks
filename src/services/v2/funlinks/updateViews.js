const { updateViews } = require('../../../data-access/v2/funlinks')

module.exports = async (mediaId, payload) => {
    return await updateViews(mediaId, payload)
}
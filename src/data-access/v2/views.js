const ViewsDB = require('../../models/v2/views')

exports.viewMedia = (mediaId, userId, type) => {
    return ViewsDB.updateOne({ mediaId, userId }, { type }, { upsert: true }).lean()
}

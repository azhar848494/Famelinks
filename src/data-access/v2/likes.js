const LikeDB = require('../../models/v2/likes');

exports.submitLike = (userId, mediaId, status) => {
    return LikeDB.findOneAndUpdate({
        userId,
        mediaId
    }, {
        $set: { status }
    }, {
        upsert: true
    }).lean();
};

exports.deleteLike = (userId, mediaId) => {
    return LikeDB.findOneAndDelete({ userId, mediaId });
};
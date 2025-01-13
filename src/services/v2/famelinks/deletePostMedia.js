const { updatePostMedia } = require("../../../data-access/v2/famelinks");

module.exports = async (postId, userId, mediaType) => {
    return updatePostMedia(postId, userId, {
        [mediaType]: null
    });
};
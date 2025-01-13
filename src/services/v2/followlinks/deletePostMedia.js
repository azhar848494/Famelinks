const { deletePostMedia } = require("../../../data-access/v2/followlinks");

module.exports = async (postId, userId, mediaName) => {
    return deletePostMedia(postId, userId, mediaName);
};
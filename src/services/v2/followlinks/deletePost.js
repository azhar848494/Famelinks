const { deletePost } = require("../../../data-access/v2/followlinks");

module.exports = (postId, userId) => {
    return deletePost(postId, userId);
};
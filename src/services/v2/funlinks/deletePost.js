const { deletePost } = require("../../../data-access/v2/funlinks");

module.exports = (postId, userId) => {
    return deletePost(postId, userId);
};
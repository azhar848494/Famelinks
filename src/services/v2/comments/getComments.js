const { getComments } = require("../../../data-access/v2/comments");

module.exports = (userId, postId, page, postType) => {
    return getComments(userId, postId, page, postType);
};
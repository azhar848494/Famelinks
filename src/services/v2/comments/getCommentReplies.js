const { getCommentReplies } = require("../../../data-access/v2/comments");

module.exports = (userId, commentId, page, postType) => {
    return getCommentReplies(userId, commentId, page, postType);
};
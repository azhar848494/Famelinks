const { getUserCommentById } = require("../../../data-access/v2/comments");

module.exports = (commentId, userId) => {
    return getUserCommentById(commentId, userId);
};
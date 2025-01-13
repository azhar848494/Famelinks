const { getOneComment } = require("../../../data-access/v2/comments");

module.exports = (commentId) => {
    return getOneComment(commentId);
};
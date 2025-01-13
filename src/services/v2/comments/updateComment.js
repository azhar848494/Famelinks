const { updateComment } = require("../../../data-access/v2/comments");
const Filter = require('bad-words');

module.exports = (commentId, body, userId) => {
    return updateComment(commentId, new Filter().clean(body), userId);
};
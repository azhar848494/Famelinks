const { getOnePost } = require("../../../data-access/v2/funlinks");

module.exports = (postId) => {
    return getOnePost(postId);
};
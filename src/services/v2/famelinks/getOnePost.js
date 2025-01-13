const { getOnePost } = require("../../../data-access/v2/famelinks");

module.exports = (postId) => {
    return getOnePost(postId);
};
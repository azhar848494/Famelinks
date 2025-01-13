const { getOnePost } = require("../../../data-access/v2/followlinks");

module.exports = (postId) => {
    return getOnePost(postId);
};
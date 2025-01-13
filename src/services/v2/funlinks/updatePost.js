const { updatePost } = require("../../../data-access/v2/funlinks");

module.exports = async (postId, payload) => {
    const postObject = {
        description: payload.description
    };

    if (payload.isSafe == true || payload.isSafe == false) {
        postObject.isSafe = payload.isSafe;
    }

    return updatePost(postId, postObject);
};
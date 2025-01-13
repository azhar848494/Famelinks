const { updatePost } = require("../../../data-access/v3/collablinks");

module.exports = async (postId, payload) => {
  return await updatePost(postId, payload);
};

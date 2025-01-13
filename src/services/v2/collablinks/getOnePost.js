const { getOnePost } = require("../../../data-access/v3/collablinks");

module.exports = (postId) => {
  return getOnePost(postId);
};

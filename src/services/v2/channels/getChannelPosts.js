const { getchannelPosts } = require("../../../data-access/v2/channels");

module.exports = (userId, page) => {
  return getchannelPosts(userId, page);
};

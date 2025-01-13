const { getProductByHashtag } = require("../../../data-access/v2/users");

module.exports = (hashTag) => {
  return getProductByHashtag(hashTag);
};

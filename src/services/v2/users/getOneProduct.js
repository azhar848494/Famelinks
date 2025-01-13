const { getOneProduct } = require("../../../data-access/v2/users");

module.exports = (productId) => {
  return getOneProduct(productId);
};

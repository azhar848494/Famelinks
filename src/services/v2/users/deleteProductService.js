const { deleteProduct } = require("../../../data-access/v2/users");

module.exports = (productId) => {
  return deleteProduct(productId);
};

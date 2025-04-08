const { getProductGrid } = require("../../../data-access/v2/users");

module.exports = (data) => {
  return getProductGrid(data);
};

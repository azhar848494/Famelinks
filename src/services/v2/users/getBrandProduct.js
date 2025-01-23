const { getProductDetails } = require("../../../data-access/v2/brandProducts");

module.exports = async (data) => {
  const result = await getProductDetails(data)
  return result[0];
};

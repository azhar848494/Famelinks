const {
  getUserBySearch,
  getproductBySearch,
} = require("../../../data-access/v2/users");

module.exports = async (searchData, challenges) => {
  let result = [];
  let products = [];

  result = await getUserBySearch(searchData);

  products = await getproductBySearch(searchData, challenges);

  return result;
};

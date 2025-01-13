const {
  getBrandProductsBySearch,
  getBrandProduct,
} = require("../../../data-access/v2/brandProducts");

module.exports = async (page, search, selfId) => {
  let result = await getBrandProductsBySearch(page, search, selfId);

  if(!search){
      result = await getBrandProduct(page, selfId);
  }
  if (result && result.length > 0) {
    return result;
  }
  return result;
};

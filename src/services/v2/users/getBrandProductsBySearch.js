const {
  getBrandProductsBySearch,
  getBrandProduct,
} = require("../../../data-access/v2/brandProducts");

module.exports = async (page, search, selfId, type) => {
  let result = await getBrandProductsBySearch(page, search, selfId);

  if(!search){
      result = await getBrandProduct(page, selfId, type);
      if(type == 'saved'){
        result = result[0].products
      }
  }
  if (result && result.length > 0) {
    return result;
  }
  return result;
};

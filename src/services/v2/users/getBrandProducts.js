const { getBrandProducts } = require("../../../data-access/v2/brandProducts");

module.exports = async (brandId, page) => {
  const result = await getBrandProducts(brandId, page);
  return result.map((item) => {
    item.media = item.media.map((oneImage) => {
      return {
        path: oneImage.media,
        type: oneImage.type,
      };
    });
    return item;
  });
};
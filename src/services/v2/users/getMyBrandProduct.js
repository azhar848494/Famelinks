const { getMyBrandProducts } = require("../../../data-access/v2/brandProducts");

module.exports = async (userId, page) => {
    console.log('Product :: ', userId);
    const result = await getMyBrandProducts(userId, page);
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
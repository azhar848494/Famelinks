const { getMyBrandProducts } = require("../../../data-access/v2/brandProducts");
var ObjectId = require("mongoose").Types.ObjectId;


module.exports = async (userId, page, postId) => {

    let filterObj = {};

    if (postId != "*") {
      filterObj = {
        $or: [
          { $expr: { $eq: ["$_id", ObjectId(postId)] } },
          { $expr: { $lt: ["$_id", ObjectId(postId)] } },
        ],
      };
    }
    const result = await getMyBrandProducts(userId, page, filterObj);
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
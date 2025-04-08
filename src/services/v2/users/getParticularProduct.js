const { getParticularProduct } = require("../../../data-access/v2/users");
var ObjectId = require("mongoose").Types.ObjectId;

module.exports = async (
  profileId,
  page,
  selfProfileId,
) => {
  let filterObj = {};
  let sortObj = {};

  filterObj = {
    userId: ObjectId(profileId),
    isDeleted: false,
    isSafe: true,
    isBlocked: false,
  };
  sortObj = { createdAt: -1 }

  const result = await getParticularProduct(
    selfProfileId,
    page,
    filterObj,
    sortObj
  );

  return result;
};
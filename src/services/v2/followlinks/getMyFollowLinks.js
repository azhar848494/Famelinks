const { getMyFollowLinks } = require("../../../data-access/v2/followlinks");
var ObjectId = require("mongoose").Types.ObjectId;

module.exports = async (
  profileId,
  page,
  selfProfileId,
  selfMasterId,
  postId
) => {
  let filterObj = {};

  if (postId != "*") {
    filterObj = {
      $or: [
        { $expr: { $eq: ["$_id", ObjectId(postId)] } },
        { $expr: { $lt: ["$_id", ObjectId(postId)] } },
      ],
    };
  }
  const result = await getMyFollowLinks(
    profileId,
    page,
    selfProfileId,
    selfMasterId,
    filterObj
  );

  return result.map(item => {
    item.media = item.media.filter(oneImage => {
      return oneImage.path;
    });
    return item;
  });
};
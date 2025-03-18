const { getMyFollowLinks } = require("../../../data-access/v2/followlinks");
var ObjectId = require("mongoose").Types.ObjectId;

module.exports = async (
  profileId,
  page,
  selfProfileId,
  selfMasterId,
  hashTagId
) => {
  let filterObj = {};

  filterObj = {
    channelId: hashTagId != null ? ObjectId(hashTagId) : ObjectId(profileId),
    isDeleted: false,
    isSafe: true,
    isBlocked: false,
  };

  // if (postId != "*") {
  //   filterObj = {
  //     $or: [
  //       { $expr: { $eq: ["$_id", ObjectId(postId)] } },
  //       { $expr: { $lt: ["$_id", ObjectId(postId)] } },
  //     ],
  //   };
  // }
  const result = await getMyFollowLinks(
    ObjectId(profileId),
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
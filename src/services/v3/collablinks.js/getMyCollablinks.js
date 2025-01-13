const { getMyCollabLinks } = require("../../../data-access/v3/collablinks");
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
  const result = await getMyCollabLinks(
    profileId,
    page,
    selfProfileId,
    selfMasterId,
    filterObj
  );
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

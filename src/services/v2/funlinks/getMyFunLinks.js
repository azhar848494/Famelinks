const {
  getMyFunLinks,
  getMusicById,
} = require("../../../data-access/v2/funlinks");
var ObjectId = require("mongoose").Types.ObjectId;

module.exports = async (userId, userProfileId, selfMasterId, hashTagId) => {

  let filterObj = {};

  if (hashTagId != null) {
    filterObj = {
      challengeId: ObjectId(hashTagId),
      isDeleted: false,
      isSafe: true,
      isBlocked: false,
    };
  } else {
    filterObj = {
      userId: userId,
      isDeleted: false,
      isSafe: true,
      isBlocked: false,
    };
  }

  // if (postId != "*") {
  //   filterObj = {
  //     $or: [
  //       { $expr: { $eq: ["$_id", ObjectId(postId)] } },
  //       { $expr: { $lt: ["$_id", ObjectId(postId)] } },
  //     ],
  //   };
  // }

  const result = await getMyFunLinks(
    userId,
    userProfileId,
    selfMasterId,
    filterObj
  );
  return Promise.all(
    result.map(async (item) => {
      if (item.musicId) {
        if (!item.audio) {
          const music = await getMusicById(item.musicId);
          if (music) {
            item.audio = music.music;
            item.musicName = `${item.musicName} - ${music.by}`;
          }
        } else {
          item.musicName = `Original Audio - ${item.musicName}`;
        }
      }
      return item;
    })
  );
};

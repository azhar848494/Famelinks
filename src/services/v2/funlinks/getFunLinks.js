const {
  getFunLinks,
  getMusicById,
} = require("../../../data-access/v2/funlinks");
var ObjectId = require("mongoose").Types.ObjectId;

module.exports = async (
  masterUserId,
  page,
  profileId,
  funlinksDate,
  funlinks,
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
  if (funlinksDate != "*" && funlinks == "next") {
    filterObj.$expr = { $lt: ["$createdAt", funlinksDate] };
  }

  if (funlinksDate != "*" && funlinks == "prev") {
    filterObj.$expr = { $gt: ["$createdAt", funlinksDate] };
  }
  const result = await getFunLinks(masterUserId, page, profileId, filterObj);
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

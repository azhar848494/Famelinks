// const queryConfig = require("../../../../queryConfig");
const {
  getFameLinksWelcomeVideo,
} = require("../../../data-access/v3/famelinks");
// const randomUtils = require('../../../utils/random');
const _ = require("lodash");
const {
  getFollowLinksWelcomeVideo,
} = require("../../../data-access/v3/followlinks");
const { getFunlinksWelcomeVideo } = require("../../../data-access/v3/funlinks");

module.
exports = async (childProfileId, userId, page) => {
  // let result1 = await getFameLinksWelcomeVideo(childProfileId, userId, page);
  // let result2 = await getFunlinksWelcomeVideo(childProfileId, userId, page);
  let result3 = await getFollowLinksWelcomeVideo(childProfileId, userId, page);
  // result1 = result1.map((item) => {
  //   return {
  //     _id: item._id,
  //     userId: item.userId,
  //     path: item.video,
  //     name: item.user.name,
  //     type: "famelinks",
  //   };
  // });
  // result2 = result2.map((item) => {
  //   return {
  //     _id: item._id,
  //     userId: item.userId,
  //     path: item.video,
  //     name: item.user.name,
  //     type: "funlinks",
  //   };
  // });
//   return result2;
  result3 = result3.map((item) => {
    return {
      _id: item._id,
      userId: item.userId,
      path: item.video,
      name: item.user.name,
      type: "followlinks",
    };
    return item.media[0];
  });
    return _.orderBy(result3, "updatedAt", "desc");
};

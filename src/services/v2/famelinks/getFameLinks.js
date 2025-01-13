const {
  getFameLinks,
  getFameLinksOfficialPosts,
} = require("../../../data-access/v2/famelinks");
const { getBrandPosts } = require("../../../data-access/v2/brandProducts");
const BrandProductsDB = require("../../../models/v2/brandProducts");
var ObjectId = require("mongoose").Types.ObjectId;

const { setData } = require("../../../redis/data-access/v1/cacheData");

// module.exports = async (userId, page) => {
//     let result = await getFameLinks(userId, page);
//     if (page === 1) {
//         const famelinksPosts = await getFameLinksOfficialPosts(userId, 1);
//         if (famelinksPosts.length) {
//             result = [famelinksPosts[0]].concat(result);
//         }
//     }
//     let getBrandPost = await getBrandPosts(userId, page)
//     result = result.concat(getBrandPost)
//     result = result.map(item => {
//         if (item.type === 'brand') {
//             let video = item.media.filter(i => i.type === 'video');
//             const images = item.media.filter(i => i.type === 'image');
//             if (video.length) {
//                 video = video[0].media;
//             } else {
//                 video = null;
//             }
//             item.media = [
//                 {
//                     path: video,
//                     type: 'video'
//                 },
//                 {
//                     path: images[0] ? images[0].media : null,
//                     type: 'closeUp'
//                 },
//                 {
//                     path: images[1] ? images[1].media : null,
//                     type: 'closeUp'
//                 },
//                 {
//                     path: images[2] ? images[2].media : null,
//                     type: 'medium'
//                 },
//                 {
//                     path: images[3] ? images[3].media : null,
//                     type: 'long'
//                 },
//                 {
//                     path: images[4] ? images[4].media : null,
//                     type: 'pose1'
//                 },
//                 {
//                     path: images[5] ? images[5].media : null,
//                     type: 'pose2'
//                 },
//                 {
//                     path: images[6] ? images[6].media : null,
//                     type: 'additional'
//                 }
//             ];
//         }
//         item.media = item.media.filter(oneImage => {
//             return oneImage.path;
//         });
//         return item;
//     });
//     return result
// };

module.exports = async (
  profileId,
  masterUserId,
  page,
  famelinksDate,
  famelinks,
  postId,
  isRecommendation,
  recommendations,
  limit
) => {
  const objectIds = recommendations.map(id => ObjectId(id));
  let filterObj = {  };
  if(isRecommendation){
    filterObj = {
      $expr: { $in: ["$_id", objectIds] }
    };
  }else{
    filterObj = {
      _id: { $nin: objectIds }
    };
  }

  if (postId != "*") {
    filterObj = {
      $or: [
        { $expr: { $eq: ["$_id", ObjectId(postId)] } },
        { $expr: { $lt: ["$_id", ObjectId(postId)] } },
      ],
    };
  }

  if (famelinksDate != "*" && famelinks == "next") {
    filterObj.$expr = { $lt: ["$createdAt", famelinksDate] };
  }

  if (famelinksDate != "*" && famelinks == "prev") {
    filterObj.$expr = { $gt: ["$createdAt", famelinksDate] };
  }
  let result = await getFameLinks(
    profileId,
    masterUserId,
    page,
    filterObj,
    limit
  );
  if (page === 1) {
    const famelinksPosts = await getFameLinksOfficialPosts(masterUserId, 1);
    if (famelinksPosts.length) {
      result = [famelinksPosts[0]].concat(result);
    }
  }
  // let getBrandPost = await getBrandPosts(masterUserId, page);
  // result = result.concat(getBrandPost);
  result = result.map((item) => {
    if (item.type === "brand") {
      let video = item.media.filter((i) => i.type === "video");
      const images = item.media.filter((i) => i.type === "image");
      if (video.length) {
        video = video[0].media;
      } else {
        video = null;
      }
      item.media = [
        {
          path: video,
          type: "video",
        },
        {
          path: images[0] ? images[0].media : null,
          type: "closeUp",
        },
        {
          path: images[1] ? images[1].media : null,
          type: "closeUp",
        },
        {
          path: images[2] ? images[2].media : null,
          type: "medium",
        },
        {
          path: images[3] ? images[3].media : null,
          type: "long",
        },
        {
          path: images[4] ? images[4].media : null,
          type: "pose1",
        },
        {
          path: images[5] ? images[5].media : null,
          type: "pose2",
        },
        {
          path: images[6] ? images[6].media : null,
          type: "additional",
        },
      ];
    }
    item.media = item.media.filter((oneImage) => {
      return oneImage.path;
    });
    return item;
  });
  return result
};

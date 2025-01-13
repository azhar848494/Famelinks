// const queryConfig = require("../../../../queryConfig");
const { getFollowLinks } = require("../../../data-access/v2/followlinks");
// const randomUtils = require('../../../utils/random');
const _ = require("lodash");
const {
  getFameLinksFollowlinks,
} = require("../../../data-access/v2/famelinks");
const { getFunlinksFollowlinks } = require("../../../data-access/v2/funlinks");
const { getBrandPosts } = require("../../../data-access/v2/brandProducts");
const { getCollabLinks } = require("../../../data-access/v3/collablinks");
var ObjectId = require("mongoose").Types.ObjectId;

module.exports = async (
  childProfileId,
  funLinksId,
  followLinksId,
  userId,
  page,
  followlinksDate,
  followlinks,
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
  if (followlinksDate != "*" && followlinks == "next") {
    filterObj.$expr = { $lt: ["$createdAt", followlinksDate] };
  }

  if (followlinksDate != "*" && followlinks == "prev") {
    filterObj.$expr = { $gt: ["$createdAt", followlinksDate] };
  }
  const result1 = await getFameLinksFollowlinks(
    childProfileId,
    userId,
    page,
    filterObj
  );
  const result2 = await getFunlinksFollowlinks(
    funLinksId,
    userId,
    page,
    filterObj
  );
  const result3 = await getFollowLinks(followLinksId, userId, page, filterObj);
  let brandPosts = await getBrandPosts(userId, page);
  let collabPost = await getCollabLinks(followLinksId, userId, page);

  brandPosts = brandPosts.map((item) => {
    item.media = item.media.map((oneImage) => {
      return {
        path: oneImage.media,
        type: oneImage.type,
      };
    });
    return item;
  });

  collabPost = collabPost.map((item) => {
    item.media = item.media.map((oneImage) => {
      return {
        path: oneImage.media,
        type: oneImage.type,
      };
    });
    return item;
  });
  const result4Filtered = result3.map((item) => {
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
  const result1Filtered = result1.map((item) => {
    item.media = item.media.filter((oneImage) => {
      return oneImage.path;
    });
    return item;
  });

  return _.orderBy(
    [
      // ...result1Filtered,
      // ...result2,
      ...result4Filtered,
      ...brandPosts,
      ...collabPost,
    ],
    "updatedAt",
    "desc"
  );
};

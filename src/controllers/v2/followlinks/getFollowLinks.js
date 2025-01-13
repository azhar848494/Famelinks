const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const getFollowLinksService = require("../../../services/v2/followlinks/getFollowLinks");
const { getLatestPosts } = require("../../../data-access/v2/followlinks");
const { setData } = require("../../../redis/data-access/v1/cacheData");

module.exports = async (request) => {
  let childProfileId = 1;
  let funLinksProfileId = 1;
  let followLinksProfileId = 1;

  let page = request.query.page;
  let followlinksfirstDate = request.query.followlinksfirstDate;
  let followlinkslastDate = request.query.followlinkslastDate;
  let followlinks = request.query.followlinks;
  followlinksfirstDate = followlinksfirstDate ? followlinksfirstDate : "*";
  followlinkslastDate = followlinkslastDate ? followlinkslastDate : "*";
  followlinks = followlinks ? followlinks : "*";
  let postId = request.query.postId;
  postId = postId ? postId : "*";
  let NewPostsAvailable = false;

  page = page ? page : 1;

  switch (request.user.type) {
    case "brand":
      childProfileId = request.user._id;
      break;
    case "agency":
      childProfileId = request.user._id;
      break;
    default:
      childProfileId = request.user._id;
      break;
  }

  funLinksProfileId = request.user._id;

  followLinksProfileId = request.user._id;

  if (followlinksfirstDate != "*") {
    let latestpost = await getLatestPosts(followlinksfirstDate);
    latestpost = latestpost - 1;
    if (latestpost > 10) {
      NewPostsAvailable = true;
    }
  }

  const result = await getFollowLinksService(
    childProfileId,
    funLinksProfileId,
    followLinksProfileId,
    request.user._id,
    page,
    followlinkslastDate,
    followlinks,
    postId
  );

  if (result.length > 0) {
    result[0].NewPostsAvailable = NewPostsAvailable;
  }

  return serializeHttpResponse(200, {
    message: "FollowLinks Fetched",
    result,
  });
};

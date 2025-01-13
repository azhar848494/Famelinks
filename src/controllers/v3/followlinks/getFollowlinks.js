const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const getFunlinksService = require("../../../services/v3/funlinks/getFunlinks");
const getFollowlinksRedis = require("../../../redis/service/followlinks/v1/getFollowlinks");
const { setExpiryData } = require("../../../redis/data-access/v1/cacheData");

module.exports = async (request) => {
  let page = request.query.page;
  let followlinksDate = request.query.followlinksDate;
  let followlinks = request.query.followlinks;

  let location = request.user.location ? request.user.location : "*";
  let ageGroup = request.user.ageGroup ? request.user.ageGroup : "*";
  let gender = request.user.gender ? request.user.gender : "*";
  followlinksDate = followlinksDate ? followlinksDate : "*";
  followlinks= followlinks? followlinks: "*";

  let blockList = request.user.blockList;

  blockList = blockList.map((userId) => userId.toString());

  page = page ? page : 1;

  let result;

  let key = "followlinks";
  key += "-" + location.toString();
  key += "-" + ageGroup.toString();
  key += "-" + gender.toString();
  key += "-" + funlinksDate.toString();
  key += "-" + funlinks.toString();
  key += "-" + page.toString();

  result = await getFollowlinksRedis(key);

  if (result) {
    result = JSON.parse(result);
  }

  if (!result) {
    result = await getFunlinksService(
      page,
      location,
      ageGroup,
      gender,
      followlinksDate,
      followlinks
    );

    await setExpiryData(key, result, 600);
  }

  result = result.filter((funlink) => {
    if (funlink.user && !blockList.includes(funlink.user._id.toString())) {
      return funlink;
    }
  });

  return serializeHttpResponse(200, {
    message: "FollowLinks Fetched",
    result,
  });
};

const { getFameLinksChallengesBySearch, getFunlinksChallengesBySearch, getbrandHashTagBySearch } = require("../../../data-access/v2/challenges");
const brandProducts = require("../../../models/v2/brandProducts");

module.exports = async (searchData, linkType) => {
  let challenges = []
  let fametrendzs = []
  let brandHashtags = []

  if ((linkType == 'famelinks'))
    fametrendzs = await getFameLinksChallengesBySearch(searchData, linkType);

  if ((linkType == 'funlinks') || (linkType == 'followlinks')) {
    challenges = await getFunlinksChallengesBySearch(searchData, linkType)
  }

  if ((linkType == 'funlinks') || (linkType == 'followlinks')) {
    brandHashtags = await getbrandHashTagBySearch(searchData, 'brand')
  }

  result = fametrendzs.concat(challenges)
  return result
};
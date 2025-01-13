const { updateFunlinksImpressions, updateFamelinksImpressions } = require('../../../data-access/v2/challenges');

module.exports =  async (challengeId, impressions) => {
     let result = await updateFamelinksImpressions(challengeId, impressions);
    if (result.matchedCount == 0) {
      result = await updateFunlinksImpressions(challengeId, impressions);
      return result;
    }
    return result;

};
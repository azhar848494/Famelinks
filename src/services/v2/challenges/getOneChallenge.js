const { getOneFamelinksChallenge, getFunChallengeDetails } = require('../../../data-access/v2/challenges');

module.exports = async (challengeId, userId) => {
    let result = await getOneFamelinksChallenge(challengeId, userId);
    if (result && result.length == 0) {
        result = await getFunChallengeDetails(challengeId, userId);
        return result;
    }
    return result;
};
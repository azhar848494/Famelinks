const { getChallengeByName } = require('../../../data-access/v2/challenges');

module.exports = (challengeName) => {
    return getChallengeByName(challengeName);
};
const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const getChallengesService = require('../../../services/v2/challenges/getChallenges');

module.exports = async (request) => {
    let sponsorId = request.query.sponsorId;
    sponsorId = sponsorId ? sponsorId : "*";

    let gender = request.user.gender;
    let ageGroup = request.user.ageGroup;
    let location = request.user.location;
    
    const result = await getChallengesService(
      "upcoming",
      request.query.page,
      request.query.search,
      request.params.type,
      sponsorId,
      gender,
      ageGroup,
      location,
      request.user._id,
    );
    return serializeHttpResponse(200, {
        message: 'Challenges Fetched',
        result
    });
};
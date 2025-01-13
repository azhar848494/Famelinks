const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const appConfig = require('../../../../configs/app.config')
const { getSliderChallenges, getSliderUpcomingChallenges } = require("../../../data-access/v2/challenges");

module.exports = async () => {
    const openChallenge = await getSliderChallenges();
    const upcomingChallenge = await getSliderUpcomingChallenges();

const result0 = openChallenge.map((e, i) => {
  const result = 
    {
      _id: openChallenge[i]._id,
      media: `${appConfig.s3.s3UrlPath}/challenges/${openChallenge[i].images}`,
      type: "image",
    }
    return result;
});
    const result1 = upcomingChallenge.map((e2,i)=>{
        const result2 = {
      _id: upcomingChallenge[i]._id,
      media: `${appConfig.s3.s3UrlPath}/challenges/${upcomingChallenge[i].images}`,
      type: "image",
    }
  return result2;
  
});
const result = [...result0, ...result1]

    return serializeHttpResponse(200, {
        message: 'Challenge Fetched',
        result
    });
};

const serializeHttpResponse = require('../../../helpers/serialize-http-response');
const getMostLikedPosts = require('../../../services/v2/homepage/getMostLikedPosts');
const getRecentUsers = require('../../../services/v2/homepage/getRecentUsers');
const getTopTrendzs = require('../../../services/v2/homepage/getTopTrendzs');

module.exports = async (request) => {

    //Algorithm steps:-
    //1. Fetch app-settings from DB and check document for today's date
    //2. Fetch relevant documents
    //2. If document == null => Show default as 'Today's Top Trendz' and return relevant data
    //3. If document != null then
    //3.a. Fetch posts array. Iterate over it and fetch the data according to the title
    //3.b. Return data 

    let result = await getMostLikedPosts(request.user._id, 6);

    let response1 = {
        title: "Today's Top-Most Likes",
        category: "post", //category=>post/user/trend
        result
    }

    result = null

    result = await getTopTrendzs(6);

    let response2 = {
        title: "Top Trendzs today",
        category: "trendz",
        result
    }

    result = null

    result = await getRecentUsers(6);

    let response3 = {
        title: "Welcome new joiners",
        category: "user",
        result
    }

    result = [response1, response2, response3]

    return serializeHttpResponse(200, {
        message: 'Homepage fetched',
        result
    })
};
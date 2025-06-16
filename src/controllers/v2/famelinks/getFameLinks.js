const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const getFameLinksService = require("../../../services/v2/famelinks/getFameLinks");
const { getLatestPosts } = require("../../../data-access/v2/famelinks");
const axios = require('axios');

const getData = async (userId) => {
  try {
    const response = await axios.post('https://famepost-recsys.famelinks.app/recommend', {
      userId: userId
    });
    return response.data;
  } catch (error) {
    console.error('Error :', error.message);
    return [];
  }
};

module.exports = async (request) => {
  let famelinkslastDate = request.query.famelinkslastDate;
  let famelinks = request.query.famelinks;
  let famelinksfirstDate = request.query.famelinksfirstDate;
  famelinkslastDate = famelinkslastDate ? famelinkslastDate : "*";
  famelinks = famelinks ? famelinks : "*";
  famelinksfirstDate = famelinksfirstDate ? famelinksfirstDate : "*";
  let postId = request.query.postId;
   postId = postId ? postId : "*";
  let NewPostsAvailable = false;

  if (famelinksfirstDate != "*") {
    let latestpost = await getLatestPosts(famelinksfirstDate);
    latestpost = latestpost -1
    if(latestpost > 10){
      NewPostsAvailable = true;
    }
  }

  const recommendations = [];
  //Uncomment below line to get recommendation data
  // const recommendations = await getData(request.user._id);
  let limit = 12;

  const result1 = await getFameLinksService(
    request.user._id,
    request.user._id,
    request.query.page,
    famelinkslastDate,
    famelinks,
    postId,
    true,
    recommendations,
    limit
  );

  if(result1){
    limit = 12 - result1.length;
  }

  const result2 = await getFameLinksService(
    request.user._id,
    request.user._id,
    request.query.page,
    famelinkslastDate,
    famelinks,
    postId,
    false,
    recommendations,
    limit
  );
  
  const result = [...result1, ...result2]

  if (!result2) {
    return serializeHttpResponse(500, {
      message: "Failed to fetch FameLinks",
      result,
    });
  }
  if (result.length > 0) {
  result[0].NewPostsAvailable = NewPostsAvailable;
  }

  return serializeHttpResponse(200, {
    message: "FameLinks Fetched",
    result,
  });
};

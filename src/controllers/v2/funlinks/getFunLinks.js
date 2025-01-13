const serializeHttpResponse = require('../../../helpers/serialize-http-response');
const getFunLinksService = require('../../../services/v2/funlinks/getFunLinks');
const { getLatestPosts } = require("../../../data-access/v2/funlinks")

module.exports = async (request) => {
    let page = request.query.page
    let funlinksfirstDate = request.query.funlinksfirstDate;
    let funlinkslastDate = request.query.funlinkslastDate;
    let funlinks = request.query.funlinks;
    funlinksfirstDate = funlinksfirstDate ? funlinksfirstDate : "*";
    funlinkslastDate = funlinkslastDate ? funlinkslastDate : "*";
    funlinks = funlinks ? funlinks : "*";
    let postId = request.query.postId;
    postId = postId ? postId : "*";
    let NewPostsAvailable = false;

    page = page ? page : 1

    if (funlinksfirstDate != "*") {
      let latestpost = await getLatestPosts(funlinksfirstDate);
      latestpost = latestpost - 1;
      if (latestpost > 10) {
        NewPostsAvailable = true;
      }
    }

    const result = await getFunLinksService(
      request.user._id,
      page,
      request.user._id,
      funlinkslastDate,
      funlinks,
      postId
    );

    if (result.length > 0) {
    result[0].NewPostsAvailable = NewPostsAvailable;
    }

    return serializeHttpResponse(200, {
        message: 'FunLinks Fetched',
        result
    });
};
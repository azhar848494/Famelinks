const serializeHttpResponse = require('../../../helpers/serialize-http-response');
const getOneBrandProductsService = require('../../../services/v2/users/getOneBrandProduct');

module.exports = async (request) => {

    let postId = request.query.postId;
    postId = postId ? postId : "*";

    const result = await getOneBrandProductsService(
      request.params.userId,
      request.query.page,
      postId
    );
    return serializeHttpResponse(200, {
        message: 'User Brand Product Fetched',
        result
    });
};
const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const getFollowersFollowees = require('../../../services/v2/users/getFollwersFollowees');

module.exports = async (request) => {
    let search = request.query.search
    const result = await getFollowersFollowees(request.user._id, request.params.type, request.query.page, request.user._id, request.query.requestType, search);
    return serializeHttpResponse(200, {
        message: 'Fetched',
        result
    });
};
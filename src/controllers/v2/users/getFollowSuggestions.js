const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const getFollowSuggestionsService = require('../../../services/v2/users/getFollowSuggestions');

module.exports = async (request) => {
    let search = request.query.search
    const result = await getFollowSuggestionsService(request.user._id, request.query.page, search);
    return serializeHttpResponse(200, {
        message: 'Suggestions Fetched',
        result
    });
};
const { getFollowSuggestions } = require("../../../data-access/v2/users");

module.exports = async (userId, page, search) => {
    const result = await getFollowSuggestions(userId, page, search);
    return result.filter(item => item._id);
};
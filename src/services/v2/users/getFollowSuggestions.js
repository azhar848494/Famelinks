const { getFollowSuggestions } = require("../../../data-access/v2/users");

module.exports = async (userId, page) => {
    const result = await getFollowSuggestions(userId, page);
    return result.filter(item => item._id);
};
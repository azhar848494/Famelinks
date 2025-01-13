const { getFollowRequest, getFollowRequestCount } = require("../../../data-access/v2/users");

exports.getFollowRequest = (userId, page) => {
    return getFollowRequest(userId, page);
};

exports.getFollowRequestCount = (userId) => {
    return getFollowRequestCount(userId);
};
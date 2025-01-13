const { submitFeedback } = require("../../../data-access/v2/users");

module.exports = (userId, body) => {
    return submitFeedback(userId, body);
};
const { unblockUser, blockUser } = require('../../../data-access/v2/users');

module.exports = async (userId, blockUserId, isBlock) => {
    if (isBlock) {
        return blockUser(userId, blockUserId);
    } else {
        return unblockUser(userId, blockUserId);
    }
};
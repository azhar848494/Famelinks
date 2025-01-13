const { inviteToFollow } = require('../../../data-access/v2/users')

module.exports = async (userId, selfId, action) => {
    return await inviteToFollow(userId, selfId, action)
}
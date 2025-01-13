const { getUserProfileImages } = require('../../../data-access/v2/users')

module.exports = async (userId) => {
    return await getUserProfileImages(userId)
}
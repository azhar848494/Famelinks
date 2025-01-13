const { getTodaysOfferPosts } = require('../../../data-access/v2/followlinks')

module.exports = async (userId) => {
    return await getTodaysOfferPosts(userId)
}
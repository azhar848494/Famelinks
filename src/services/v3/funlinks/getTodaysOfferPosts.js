const { getTodaysOfferPosts } = require('../../../data-access/v2/funlinks')

module.exports = async (userId) => {
    return await getTodaysOfferPosts(userId)
}
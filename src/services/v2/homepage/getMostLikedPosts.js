const { getMostLikedPosts } = require('../../../data-access/v2/homepage')

module.exports = async (userId, limit) => {
    let result = await getMostLikedPosts(userId, limit)
    result = result.map((item) => {
        item.media = item.media.filter((media) => {
            return media.path
        })
        return item
    })
    return result
}
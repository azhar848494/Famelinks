const { getRecentUsers } = require('../../../data-access/v2/homepage')

module.exports = async (limit) => {
    let result = await getRecentUsers(limit)
    // result = result.map((item) => {
    //     item.media = item.media.filter((media) => {
    //         return media.path
    //     })
    //     return item
    // })
    return result
}
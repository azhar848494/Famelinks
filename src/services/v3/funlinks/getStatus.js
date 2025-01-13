const { getFunlinksStatus } = require('../../../data-access/v3/funlinks')

module.exports = async (postIds, profileId, masterUserId) => {
    return await getFunlinksStatus(postIds, profileId, masterUserId)
}
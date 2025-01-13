const { getFameLinksByUserId } = require('../../../data-access/v2/famelinks')

module.exports = async (userId, challengeId) => {
    return await getFameLinksByUserId(userId, challengeId)
}
const { getClubs } = require('../../../data-access/v2/clubs')

module.exports = async () => {
    return await getClubs()
}
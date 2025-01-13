const { addClubs } = require('../../../data-access/v2/clubs')

module.exports = async (payload) => {
    return await addClubs(payload)
}
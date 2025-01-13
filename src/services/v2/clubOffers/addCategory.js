const { addCategory } = require('../../../data-access/v2/clubOffers')

module.exports = async (name) => {
    return await addCategory(name)
}
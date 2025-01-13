const { searchCategory } = require('../../../data-access/v2/clubOffers')

module.exports = async (searchData, page) => {
    return await searchCategory(searchData, page)
}
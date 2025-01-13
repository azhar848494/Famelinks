const serializeHttpResponse = require('../../../helpers/serialize-http-response')
const searchCategory = require('../../../services/v2/clubOffers/searchCategory')

module.exports = async (request) => {
    let searchData = request.params.searchData.toLowerCase();
    let page = request.query.page

    let result = await searchCategory(searchData, page)

    return serializeHttpResponse(200, {
        message: 'Category fetched',
        result
    })
}



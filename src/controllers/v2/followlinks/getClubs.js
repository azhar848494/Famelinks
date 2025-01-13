const serializeHttpResponse = require('../../../helpers/serialize-http-response')
const getClubsService = require('../../../services/v2/clubs/getClubs')

module.exports = async (request) => {
    let result = []

    result = await getClubsService()

    return serializeHttpResponse(200, {
        message: 'Clubs fetched successfuly',
        result
    })
}
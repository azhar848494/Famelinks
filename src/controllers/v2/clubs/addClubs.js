const serializeHttpResponse = require('../../../helpers/serialize-http-response')
const addClubsService = require('../../../services/v2/clubs/addClubs')

module.exports = async (request) => {
    let payload = request.body

    let result = await addClubsService(payload)

    if (!result) {
        return serializeHttpResponse(500, {
            message: 'Failed to add new club'
        })
    }

    return serializeHttpResponse(200, {
        message: 'Club added successfuly'
    })
}
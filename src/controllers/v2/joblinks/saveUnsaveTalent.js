const serializeHttpResponse = require('../../../helpers/serialize-http-response');
const { isValidObjectId } = require('../../../utils/db');
const saveTalentService = require('../../../services/v2/joblinks/saveUnsaveTalent')

module.exports = async (request) => {
    let userId = request.user._id
    let toId = request.body.userId
    let saveTalent = request.body.save

    if (!isValidObjectId(userId)) {
        return serializeHttpResponse(400, {
            message: 'Invalid user Id'
        });
    }

    result = await saveTalentService({userId, toId, saveTalent})

    if (!result) {
        let message = (saveTalent == true) ? 'Failed to save the user' : 'Failed to unsave the user'
        return serializeHttpResponse(500, {
            message,
        })
    }

    let message = (saveTalent == true) ? 'Talent saved successfuly' : 'Talent unsaved successfuly'
    return serializeHttpResponse(200, {
        message,
        result
    })
}

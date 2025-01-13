const serializeHttpResponse = require('../../../helpers/serialize-http-response');
const { isValidObjectId } = require('../../../utils/db');
const saveTalentService = require('../../../services/v2/joblinks/saveUnsaveTalent')

module.exports = async (request) => {
    let userId = request.body.userId
    let saveTalent = request.body.save
    let childProfileId

    if (!isValidObjectId(userId)) {
        return serializeHttpResponse(400, {
            message: 'Invalid user Id'
        });
    }

    childProfileId = request.user._id

    result = await saveTalentService(childProfileId, userId, saveTalent)

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

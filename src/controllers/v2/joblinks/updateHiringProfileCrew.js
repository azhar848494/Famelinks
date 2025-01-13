const serializeHttpResponse = require('../../../helpers/serialize-http-response');
const updateHiringProfile = require('../../../services/v2/joblinks/updateHiringProfile');
const getHiringProfile = require('../../../services/v2/joblinks/getHiringProfile');

module.exports = async (request) => {
    if (request.user.type == 'brand') {
        return serializeHttpResponse(400, {
            message: 'Operation invalid'
        });
    }

    let payload = request.body

    let childProfile = await getHiringProfile(request.user._id, 'crew')

    let childProfileId = childProfile[0]._id

    if (!childProfileId) {
        return serializeHttpResponse(400, {
            message: 'Joblinks profile not found'
        });
    }

    let result = await updateHiringProfile(childProfileId, payload)

    if (!result) {
        return serializeHttpResponse(500, {
            message: 'Failed to update hiring profile of the user'
        });
    }

    return serializeHttpResponse(200, {
        message: 'Hiring profile of the user update successfuly'
    });
}
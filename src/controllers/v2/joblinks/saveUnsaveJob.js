const serializeHttpResponse = require('../../../helpers/serialize-http-response');
const { isValidObjectId } = require('../../../utils/db');
const saveUnsaveJob = require('../../../services/v2/joblinks/saveUnsaveJob')
const checkJob = require("../../../services/v2/joblinks/checkJob")

module.exports = async (request) => {
    // if (request.user.type == 'brand') {
    //     return serializeHttpResponse(400, {
    //         message: 'Operation denied. Brand cannot save any job'
    //     });
    // }

    let jobId = request.params.jobId
    let action = request.query.action
    let result, childProfileId

    if (!isValidObjectId(jobId)) {
        return serializeHttpResponse(400, {
            message: 'Invalid job Id'
        });
    }

    let job = await checkJob(jobId)

    if (job && job.length == 0) {
        return serializeHttpResponse(400, {
            message: "Job does not exists",
        });
    }

    let jobType = job[0].jobType

    if (request.user.type == 'agency' && jobType == 'faces') {
        return serializeHttpResponse(400, {
            message: "Operation denied. Agency cannot save any front faces jobs",
        });
    }

    childProfileId = request.user._id

    if (!childProfileId) {
        return serializeHttpResponse(500, {
            message: "Failed to fetch child profile of the user",
        });
    }

    result = await saveUnsaveJob(childProfileId, jobId, action)

    if (!result) {
        let message = (saveTalent == true) ? 'Failed to save the job' : 'Failed to unsave the job'
        return serializeHttpResponse(500, {
            message,
        });
    }

    let message = (action == 'save') ? 'Job saved successfuly' : 'Job unsaved successfuly'
    return serializeHttpResponse(200, {
        message,
        result
    });
}

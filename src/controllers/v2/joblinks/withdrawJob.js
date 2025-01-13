const serializeHttpResponse = require('../../../helpers/serialize-http-response');
const withdrawJob = require("../../../services/v2/joblinks/withdrawJob")
const checkJob = require("../../../services/v2/joblinks/checkJob")
const { isValidObjectId } = require('../../../utils/db');

module.exports = async (request) => {
    if (request.user.type == 'brand') {
        return serializeHttpResponse(400, {
            message: 'Operation denied. Brand cannot withdraw any job'
        });
    }

    let jobId = request.params.jobId
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
            message: "Operation denied. Agency cannot withdraw any front faces jobs",
        });
    }

    childProfileId = request.user._id

    if (!childProfileId) {
        return serializeHttpResponse(500, {
            message: "Failed to fetch child profile of the user",
        });
    }

    result = await withdrawJob(childProfileId, jobId)
    if (!result) {
        return serializeHttpResponse(500, {
            message: "Failed to withdraw job",
        });
    }

    return serializeHttpResponse(200, {
        message: "Job withdrew successfuly",
        result
    });

}

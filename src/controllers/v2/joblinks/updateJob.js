const serializeHttpResponse = require('../../../helpers/serialize-http-response');
const updateJob = require("../../../services/v2/joblinks/updateJob")
const { isValidObjectId } = require('../../../utils/db');
const checkJob = require("../../../services/v2/joblinks/checkJob")

module.exports = async (request) => {
    let jobId = request.params.jobId
    let result

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

    if (job[0].createdBy[0]._id.toString() != request.user._id) {
        return serializeHttpResponse(400, {
            message: "Permission denied. Cannot update the job details",
        });
    }

    result = await updateJob(jobId, request.body)
    if (!result) {
        return serializeHttpResponse(500, {
            message: "Failed to update job",
        });
    }

    return serializeHttpResponse(200, {
        message: "Job updated successfuly",
        result
    });
}
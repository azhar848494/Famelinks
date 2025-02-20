const serializeHttpResponse = require('../../../helpers/serialize-http-response')
const getInviteApplicants = require('../../../services/v2/joblinks/getInviteApplicants')
const { isValidObjectId } = require('../../../utils/db')
const checkJob = require("../../../services/v2/joblinks/checkJob")

module.exports = async (request) => {
    const userId = request.user._id
    const jobId = request.params.jobId
    const page = request.query.page || 1
    const search = request.query.search

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

    let result = await getInviteApplicants({ userId, jobId, type: job[0].jobType, page, search })

    if (!result) {
        return serializeHttpResponse(500, {
            message: "Failed to fetch job applicants",
        });
    }

    return serializeHttpResponse(200, {
        message: "Applicants fetched successfuly",
        result
    });
}
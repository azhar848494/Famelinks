const serializeHttpResponse = require('../../../helpers/serialize-http-response')
const checkJob = require("../../../services/v2/joblinks/checkJob")
const getApplicants = require('../../../services/v2/joblinks/getApplicants')
const updateJob = require('../../../services/v2/joblinks/updateJob')

module.exports = async (request) => {
    let jobId = request.params.jobId
    let page = request.query.page

    const { isValidObjectId } = require('../../../utils/db');

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

    let result = await getApplicants(request.user._id, jobId, job[0].jobType, page)

    if (!result) {
        return serializeHttpResponse(500, {
            message: "Failed to fetch job applicants",
        });
    }

    let currentDate = new Date()
    await updateJob(jobId, { lastVisited: currentDate })

    return serializeHttpResponse(200, {
        message: "Job applicants fetched successfuly",
        result
    });
}
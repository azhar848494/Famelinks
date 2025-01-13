const serializeHttpResponse = require('../../../helpers/serialize-http-response')
const closeJobService = require('../../../services/v2/joblinks/closeJob')
const { isValidObjectId } = require('../../../utils/db')
const checkJob = require('../../../services/v2/joblinks/checkJob')

module.exports = async (request) => {
    const jobId = request.params.jobId
    const close = request.body.close
    let message = ''

    if (!isValidObjectId(jobId)) {
        return serializeHttpResponse(400, {
            message: 'Invalid job id'
        })
    }

    let job = await checkJob(jobId)

    if (job && job.length == 0) {
        return serializeHttpResponse(400, {
            message: 'Job does not exist'
        })
    }

    if (job[0].createdBy[0]._id.toString() != request.user._id) {
        return serializeHttpResponse(400, {
            message: "Permission denied. Cannot close the job",
        });
    }

    let result = await closeJobService(jobId, close)

    message = (close == true) ? 'Failed to close the job' : 'Failed to re-open the job'
    if (!result) {
        return serializeHttpResponse(500, {
            message
        })
    }

    message = (close == true) ? 'Job closed successfuly' : 'Job re-opened successfuly'
    return serializeHttpResponse(200, {
        message
    })
}
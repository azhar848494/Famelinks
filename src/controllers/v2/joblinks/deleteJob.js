const serializeHttpResponse = require('../../../helpers/serialize-http-response')
const deleteJobService = require('../../../services/v2/joblinks/deleteJob')
const { isValidObjectId } = require('../../../utils/db')
const checkJob = require('../../../services/v2/joblinks/checkJob')

module.exports = async (request) => {
    const jobId = request.params.jobId

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
            message: "Permission denied. Cannot delete the job",
        });
    }

    let result = await deleteJobService(jobId)
    
    if (!result) {
        return serializeHttpResponse(500, {
            message: 'Failed to close the job',
        })
    }

    return serializeHttpResponse(200, {
        message: 'Job deleted successfuly'
    })
}
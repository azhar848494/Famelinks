const serializeHttpResponse = require('../../../helpers/serialize-http-response')
const getJobDetailsService = require('../../../services/v2/joblinks/getJobDetails')
const { isValidObjectId } = require('../../../utils/db')

module.exports = async (request) => {
    let jobId = request.params.jobId

    if (!isValidObjectId(jobId)) {
        return serializeHttpResponse(400, {
            message: 'Invalid job Id'
        });
    }

    let result = await getJobDetailsService(jobId)

    if (!result) {
        return serializeHttpResponse(500, {
            message: 'Failed to fetch job details'
        })
    }

    return serializeHttpResponse(200, {
        message: 'Job details fetched succesfuly',
        result
    })
}
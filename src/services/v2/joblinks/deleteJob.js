const { deleteJob } = require('../../../data-access/v2/joblinks')

module.exports = async (jobId) => {
    return await deleteJob(jobId)
}
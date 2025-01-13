const { closeJob } = require('../../../data-access/v2/joblinks')

module.exports = async (jobId, close) => {
    return await closeJob(jobId, close)
}
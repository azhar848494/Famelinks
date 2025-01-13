const { getClosedJobs } = require('../../../data-access/v2/joblinks')

module.exports = async (joblinksId, page, jobType) => {
    return await getClosedJobs(joblinksId, page, jobType)
}
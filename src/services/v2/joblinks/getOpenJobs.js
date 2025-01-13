const { getOpenJobs } = require('../../../data-access/v2/joblinks')

module.exports = async (joblinksId, page, jobType) => {
    return await getOpenJobs(joblinksId, page, jobType)
}
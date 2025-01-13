const { inviteForJob } = require('../../../data-access/v2/joblinks')

module.exports = async (jobId, userId, selfId, action, jobType) => {
    return await inviteForJob(jobId, userId, selfId, action, jobType)
}
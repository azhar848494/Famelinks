const { updateJob, updateJobApplication } = require('../../../data-access/v2/joblinks')

module.exports = async (jobId, userId, closeJob) => {
    let updateObj = {}
    updateObj.hiredApplicants = userId
    updateObj.isClosed = closeJob

    let result = await updateJob(jobId, updateObj)

    if (!result) { return }

    return await updateJobApplication(userId, jobId, 'hired')
}
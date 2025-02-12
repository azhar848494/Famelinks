const { updateJob,updateHiredJob, updateJobApplication } = require('../../../data-access/v2/joblinks')

module.exports = async (jobId, userId, closeJob) => {
    let updateObj = {}
    updateObj.isClosed = closeJob

    await updateHiredJob(jobId, { hiredApplicants: userId })
    let result = await updateJob(jobId, updateObj)

    if (!result) { return }

    return await updateJobApplication(userId, jobId, 'hired')
}
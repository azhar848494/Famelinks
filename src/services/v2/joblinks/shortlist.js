const { shortlistUser, deListUser, updateJobApplication } = require('../../../data-access/v2/joblinks')

module.exports = async (jobId, userId, shortlist) => {
    let updateObj = {}

    if (shortlist) {
        updateObj.shortlistedApplicants = userId

        let result = await shortlistUser(jobId, updateObj)

        if (!result) { return }

        return await updateJobApplication(userId, jobId, 'shortlisted')
    }

    if (!shortlist) {

        let result = await deListUser(jobId, userId)

        if (!result) { return }

        return await updateJobApplication(userId, jobId, 'applied')

    }
}
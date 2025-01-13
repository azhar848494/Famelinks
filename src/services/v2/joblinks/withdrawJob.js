const { updateJobApplication } = require("../../../data-access/v2/joblinks")

module.exports = async (userId, jobId) => {
    let result = await updateJobApplication(userId, jobId, 'withdraw')

    if (!result) { return }

    return result
}
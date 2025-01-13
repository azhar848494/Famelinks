const { updateSavedJobs } = require("../../../data-access/v2/joblinks")

//MasterIdMigration
module.exports = async (userId, jobId, action) => {
    if (action == 'unsave') {
        return await updateSavedJobs(userId, 'unsave', jobId)
    }
    return await updateSavedJobs(userId, 'save', jobId)
}
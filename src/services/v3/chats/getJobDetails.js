const { getJobDetails } = require('../../../data-access/v3/chats')

module.exports = async (jobId) => {
    return await getJobDetails(jobId)
}
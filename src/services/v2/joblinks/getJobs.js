const { getUserJobs, getAgentJobs } = require('../../../data-access/v2/joblinks')

module.exports = async (joblinksId, userType, page) => {
    // switch (userType) {
    // case 'individual': return await getUserJobs(joblinksId, page)
    // break;
    // case 'agency': return await getAgentJobs(joblinksId, page)
    // break;
    // }
    return await getUserJobs(joblinksId, page)
}
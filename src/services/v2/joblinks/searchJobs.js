const { searchJobs } = require('../../../data-access/v2/joblinks')

module.exports = async (selfJoblinksId, title, page) => {
    return await searchJobs(selfJoblinksId, title, page)
}
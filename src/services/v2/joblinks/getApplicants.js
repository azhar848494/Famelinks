const { getApplicantsFaces, getApplicantsCrew } = require('../../../data-access/v2/joblinks')

module.exports = async (selfMasterId, jobId, jobType, page) => {
    switch (jobType) {
        case 'faces': return await getApplicantsFaces(selfMasterId, jobId, page)
            break;
        case 'crew': return await getApplicantsCrew(selfMasterId, jobId, page)
            break;
        default: return
            break;
    }
}
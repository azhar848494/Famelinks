const { getHiringProfile } = require('../../../data-access/v2/joblinks')

module.exports = async (profileId, profileType) => {
    return await getHiringProfile(profileId, profileType)
}
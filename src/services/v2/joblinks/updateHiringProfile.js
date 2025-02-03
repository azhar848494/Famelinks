const { updateHiringProfile } = require("../../../data-access/v2/joblinks")

module.exports = async (profileId, profileType, payload) => {
    return await updateHiringProfile(profileId, profileType, payload)
}
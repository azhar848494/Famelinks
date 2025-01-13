const { updateHiringProfile } = require("../../../data-access/v2/joblinks")

module.exports = async (userId, payload) => {
    return await updateHiringProfile(userId, payload)
}
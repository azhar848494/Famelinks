const { getMasterProfile } = require("../../../data-access/v2/users")

module.exports = async (childProfileId) => {
    return await getMasterProfile(childProfileId)
}
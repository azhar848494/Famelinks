const { updateProfileJoblinks } = require('../../../data-access/v2/users')

module.exports = async (greetVideo, profileId) => {
    let updateObj = {}

    updateObj.greetVideo = greetVideo

    return await updateProfileJoblinks(profileId, updateObj)
}
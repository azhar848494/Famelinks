const { saveUser, unSaveUser } = require('../../../data-access/v2/joblinks')

//MasterIdMigration
module.exports = async (profileId, userId, save) => {
    let updateObj = {}

    if (save) {
        let result = await saveUser(profileId, userId)
        return result
    }

    if (!save) {
        let result = await unSaveUser(profileId, userId)
        return result
    }
}
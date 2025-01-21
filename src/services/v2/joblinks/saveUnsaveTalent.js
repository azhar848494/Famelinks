const { saveUser, unSaveUser } = require('../../../data-access/v2/joblinks')

//MasterIdMigration
module.exports = async (data) => {
    let result;
    if (data.saveTalent) {
        result = await saveUser(data)
    } else {
        result = await unSaveUser(data)
    }
    return result
}
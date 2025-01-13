const settingDB = require('../../models/v2/settings');

exports.getSettings = () => {
    return settingDB.find()
}
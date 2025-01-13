const { getSettings } = require('../../../data-access/v2/getSettings')

module.exports = async () => {
    return await getSettings()
}
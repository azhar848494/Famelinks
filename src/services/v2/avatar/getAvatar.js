const { getAvatar } = require('../../../data-access/v2/avatar')

module.exports = async () => {
    return await getAvatar()
}
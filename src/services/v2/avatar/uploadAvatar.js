const { uploadAvatar } = require('../../../data-access/v2/avatar')

module.exports = async (name) => {
    return await uploadAvatar({ name })
}
const { updateSavedProducts } = require('../../../data-access/v2/users')

module.exports = async (masterUserId, productId) => {
    let data = { $addToSet: { savedProducts: productId } }
    return await updateSavedProducts(masterUserId, data)
}
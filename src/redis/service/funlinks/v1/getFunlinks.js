const { getData } = require('../../../data-access/v1/cacheData')

module.exports = async (key) => {
    try {
        return await getData(key)
    }
    catch (error) {
        console.log(error)
        return
    }
}
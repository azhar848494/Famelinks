const { redisClass } = require('../../../../redis')

const getData = async (key) => {
    let redisClient = redisClass.getClient()
    if (!redisClient) { return }

    return await redisClient.get(key)
}

const setData = async (key, value) => {
    let redisClient = redisClass.getClient()
    if (!redisClient) { return }

    return await redisClient.set(key, JSON.stringify(value))
}

const setExpiryData = async (key, value, expiry) => {
    expiry = expiry ? expiry : 1
    let redisClient = redisClass.getClient()
    if (!redisClient) { return }

    return await redisClient.setEx(key, expiry, JSON.stringify(value))
}

module.exports = {
    getData,
    setData,
    setExpiryData
}